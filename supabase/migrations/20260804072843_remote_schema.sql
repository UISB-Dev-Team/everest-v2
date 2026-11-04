SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE TYPE "public"."bill_status_enum" AS ENUM (
    'Unpaid',
    'Partial',
    'Paid'
);
ALTER TYPE "public"."bill_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."enrollment_status_enum" AS ENUM (
    'active',
    'inactive',
    'graduated',
    'transferred'
);
ALTER TYPE "public"."enrollment_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."event_status_enum" AS ENUM (
    'Active',
    'Completed',
    'Cancelled'
);
ALTER TYPE "public"."event_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."fine_status_enum" AS ENUM (
    'Unpaid',
    'Paid',
    'Waived'
);
ALTER TYPE "public"."fine_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."payment_status_enum" AS ENUM (
    'Paid',
    'Pending',
    'Waived'
);
ALTER TYPE "public"."payment_status_enum" OWNER TO "postgres";
CREATE TYPE "public"."semester_enum" AS ENUM (
    '1st',
    '2nd',
    'Summer'
);
ALTER TYPE "public"."semester_enum" OWNER TO "postgres";
CREATE TYPE "public"."user_role_enum" AS ENUM (
    'super_admin',
    'adviser',
    'treasurer',
    'auditor',
    'sa',
    'dormer'
);
ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."is_active_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT is_active FROM profiles WHERE id = auth.uid();
$$;
ALTER FUNCTION "public"."is_active_user"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."is_dorm_staff"("dorm_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM dormitory_roles
    WHERE user_id = auth.uid()
      AND dormitory_id = dorm_id
      AND role IN ('adviser','treasurer','auditor','sa')
      AND is_active = true
  );
$$;
ALTER FUNCTION "public"."is_dorm_staff"("dorm_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."is_super_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM dormitory_roles
    WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
$$;
ALTER FUNCTION "public"."is_super_admin"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."my_dorm_role"("dorm_id" "uuid") RETURNS "public"."user_role_enum"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM dormitory_roles
  WHERE user_id = auth.uid()
    AND dormitory_id = dorm_id
    AND is_active = true
  LIMIT 1;
$$;
ALTER FUNCTION "public"."my_dorm_role"("dorm_id" "uuid") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."academic_periods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "academic_year" character varying(20) NOT NULL,
    "semester" "public"."semester_enum" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "is_current" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    CONSTRAINT "chk_dates" CHECK (("end_date" > "start_date"))
);
ALTER TABLE "public"."academic_periods" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."bills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dormer_id" "uuid" NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "academic_period_id" "uuid" NOT NULL,
    "billing_month" character varying NOT NULL,
    "regular_charge_id" "uuid",
    "description" "text" NOT NULL,
    "total_amount_due" numeric(10,2) NOT NULL,
    "amount_paid" numeric(10,2) DEFAULT 0 NOT NULL,
    "status" "public"."bill_status_enum" DEFAULT 'Unpaid'::"public"."bill_status_enum" NOT NULL,
    "due_date" "date",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_deleted" boolean DEFAULT false,
    CONSTRAINT "bills_total_amount_due_check" CHECK (("total_amount_due" >= (0)::numeric))
);
ALTER TABLE "public"."bills" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."clearance_certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "academic_period_id" "uuid" DEFAULT "gen_random_uuid"(),
    "dormer_id" "uuid" DEFAULT "gen_random_uuid"(),
    "issued_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."clearance_certificates" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."dormitories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "location" character varying(100),
    "capacity" integer NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "logo_url" "text",
    CONSTRAINT "dormitories_capacity_check" CHECK (("capacity" > 0))
);
ALTER TABLE "public"."dormitories" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."dormitory_enrollment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dormer_id" "uuid" NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "academic_period_id" "uuid" NOT NULL,
    "room_number" character varying(20),
    "status" "public"."enrollment_status_enum" DEFAULT 'active'::"public"."enrollment_status_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."dormitory_enrollment" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."dormitory_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "dormitory_id" "uuid",
    "role" "public"."user_role_enum" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "assigned_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "primary_adviser" boolean DEFAULT false NOT NULL
);
ALTER TABLE "public"."dormitory_roles" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."event_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "dormer_id" "uuid" NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "academic_period_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "payment_method" character varying(40),
    "payment_date" "date",
    "status" "public"."payment_status_enum" DEFAULT 'Paid'::"public"."payment_status_enum" NOT NULL,
    "notes" "text",
    "recorded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_deleted" boolean NOT NULL,
    CONSTRAINT "event_payments_amount_check" CHECK (("amount" >= (0)::numeric))
);
ALTER TABLE "public"."event_payments" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "academic_period_id" "uuid" NOT NULL,
    "name" character varying(150) NOT NULL,
    "description" "text",
    "amount_due" numeric(10,2) NOT NULL,
    "due_date" "date",
    "status" "public"."event_status_enum" DEFAULT 'Active'::"public"."event_status_enum" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_deleted" boolean NOT NULL,
    CONSTRAINT "events_amount_due_check" CHECK (("amount_due" >= (0)::numeric))
);
ALTER TABLE "public"."events" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "academic_period_id" "uuid" NOT NULL,
    "title" character varying(150) NOT NULL,
    "description" "text",
    "amount" numeric(10,2) NOT NULL,
    "category" character varying(60),
    "expense_date" "date" NOT NULL,
    "receipt_image_url" "text",
    "recorded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_deleted" boolean,
    CONSTRAINT "expenses_amount_check" CHECK (("amount" > (0)::numeric))
);
ALTER TABLE "public"."expenses" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."fine_impositions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fine_id" "uuid" NOT NULL,
    "dormer_id" "uuid" NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "academic_period_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "remarks" "text",
    "date_imposed" "date" NOT NULL,
    "imposed_by" "uuid",
    "status" "public"."fine_status_enum" DEFAULT 'Unpaid'::"public"."fine_status_enum" NOT NULL,
    "amount_paid" numeric(10,2) DEFAULT 0 NOT NULL,
    "payment_method" character varying(40),
    "payment_date" timestamp with time zone,
    "recorded_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "dormitory_enrollment_id" "uuid"
);
ALTER TABLE "public"."fine_impositions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."fines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "name" character varying(150) NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "description" "text",
    "is_deleted" boolean DEFAULT false NOT NULL,
    "recorded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "academic_period_id" "uuid",
    CONSTRAINT "fines_amount_check" CHECK (("amount" > (0)::numeric))
);
ALTER TABLE "public"."fines" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bill_id" "uuid" NOT NULL,
    "dormer_id" "uuid" NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "academic_period_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "payment_method" character varying(40),
    "notes" "text",
    "recorded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payments_amount_check" CHECK (("amount" > (0)::numeric))
);
ALTER TABLE "public"."payments" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" character varying(80) NOT NULL,
    "last_name" character varying(80) NOT NULL,
    "email" "text" NOT NULL,
    "phone" character varying(20),
    "is_active" boolean DEFAULT true NOT NULL,
    "deactivation_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."profiles" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."regular_charges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dormitory_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "description" "text",
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "academic_period_id" "uuid",
    CONSTRAINT "regular_charges_amount_check" CHECK (("amount" > (0)::numeric))
);
ALTER TABLE "public"."regular_charges" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "room_names" "text" DEFAULT ''::"text",
    "dormitory_id" "uuid" DEFAULT "gen_random_uuid"()
);
ALTER TABLE "public"."rooms" OWNER TO "postgres";
ALTER TABLE "public"."rooms" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."rooms_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
ALTER TABLE ONLY "public"."academic_periods"
    ADD CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."clearance_certificates"
    ADD CONSTRAINT "clearance_certificate_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."dormitories"
    ADD CONSTRAINT "dormitories_name_key" UNIQUE ("name");
ALTER TABLE ONLY "public"."dormitories"
    ADD CONSTRAINT "dormitories_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."dormitory_enrollment"
    ADD CONSTRAINT "dormitory_enrollment_dormer_dormitory_unique" UNIQUE ("dormer_id", "dormitory_id", "academic_period_id");
ALTER TABLE ONLY "public"."dormitory_enrollment"
    ADD CONSTRAINT "dormitory_enrollment_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."dormitory_roles"
    ADD CONSTRAINT "dormitory_roles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."dormitory_roles"
    ADD CONSTRAINT "dormitory_roles_user_id_key" UNIQUE ("user_id");
ALTER TABLE ONLY "public"."event_payments"
    ADD CONSTRAINT "event_payments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."fine_impositions"
    ADD CONSTRAINT "fine_impositions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."fines"
    ADD CONSTRAINT "fines_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."regular_charges"
    ADD CONSTRAINT "regular_charges_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."dormitory_enrollment"
    ADD CONSTRAINT "uq_enrollment" UNIQUE ("dormer_id", "dormitory_id", "academic_period_id");
ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "uq_monthly_bill" UNIQUE ("dormer_id", "dormitory_id", "billing_month", "regular_charge_id");
ALTER TABLE ONLY "public"."academic_periods"
    ADD CONSTRAINT "uq_period" UNIQUE ("academic_year", "semester");
ALTER TABLE ONLY "public"."dormitory_roles"
    ADD CONSTRAINT "uq_user_dorm_role" UNIQUE ("user_id", "dormitory_id", "role");
CREATE UNIQUE INDEX "uix_one_current_period" ON "public"."academic_periods" USING "btree" ("is_current") WHERE ("is_current" = true);
CREATE OR REPLACE TRIGGER "trg_bills_updated_at" BEFORE UPDATE ON "public"."bills" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE OR REPLACE TRIGGER "trg_dormitories_updated_at" BEFORE UPDATE ON "public"."dormitories" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE OR REPLACE TRIGGER "trg_fine_impositions_updated_at" BEFORE UPDATE ON "public"."fine_impositions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();
ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_dormer_id_fkey" FOREIGN KEY ("dormer_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_regular_charge_id_fkey" FOREIGN KEY ("regular_charge_id") REFERENCES "public"."regular_charges"("id");
ALTER TABLE ONLY "public"."clearance_certificates"
    ADD CONSTRAINT "clearance_certificate_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."clearance_certificates"
    ADD CONSTRAINT "clearance_certificate_dormer_id_fkey" FOREIGN KEY ("dormer_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."dormitory_enrollment"
    ADD CONSTRAINT "dormitory_enrollment_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."dormitory_enrollment"
    ADD CONSTRAINT "dormitory_enrollment_dormer_id_fkey" FOREIGN KEY ("dormer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."dormitory_enrollment"
    ADD CONSTRAINT "dormitory_enrollment_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."dormitory_roles"
    ADD CONSTRAINT "dormitory_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."dormitory_roles"
    ADD CONSTRAINT "dormitory_roles_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."dormitory_roles"
    ADD CONSTRAINT "dormitory_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."event_payments"
    ADD CONSTRAINT "event_payments_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."event_payments"
    ADD CONSTRAINT "event_payments_dormer_id_fkey" FOREIGN KEY ("dormer_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."event_payments"
    ADD CONSTRAINT "event_payments_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."event_payments"
    ADD CONSTRAINT "event_payments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id");
ALTER TABLE ONLY "public"."event_payments"
    ADD CONSTRAINT "event_payments_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."fine_impositions"
    ADD CONSTRAINT "fine_impositions_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."fine_impositions"
    ADD CONSTRAINT "fine_impositions_dormer_id_fkey" FOREIGN KEY ("dormer_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."fine_impositions"
    ADD CONSTRAINT "fine_impositions_dormitory_enrollment_id_fkey" FOREIGN KEY ("dormitory_enrollment_id") REFERENCES "public"."dormitory_enrollment"("id");
ALTER TABLE ONLY "public"."fine_impositions"
    ADD CONSTRAINT "fine_impositions_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."fine_impositions"
    ADD CONSTRAINT "fine_impositions_fine_id_fkey" FOREIGN KEY ("fine_id") REFERENCES "public"."fines"("id");
ALTER TABLE ONLY "public"."fine_impositions"
    ADD CONSTRAINT "fine_impositions_imposed_by_fkey" FOREIGN KEY ("imposed_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."fine_impositions"
    ADD CONSTRAINT "fine_impositions_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."fines"
    ADD CONSTRAINT "fines_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."fines"
    ADD CONSTRAINT "fines_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."fines"
    ADD CONSTRAINT "fines_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id");
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_dormer_id_fkey" FOREIGN KEY ("dormer_id") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id");
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."regular_charges"
    ADD CONSTRAINT "regular_charges_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "public"."academic_periods"("id");
ALTER TABLE ONLY "public"."regular_charges"
    ADD CONSTRAINT "regular_charges_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_dormitory_id_fkey" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id");
CREATE POLICY "ALL" ON "public"."bills" USING (true) WITH CHECK (true);
CREATE POLICY "ALL" ON "public"."clearance_certificates" USING (true) WITH CHECK (true);
CREATE POLICY "ALL" ON "public"."event_payments" USING (true) WITH CHECK (true);
CREATE POLICY "ALL" ON "public"."expenses" USING (true) WITH CHECK (true);
CREATE POLICY "ALL" ON "public"."fine_impositions" USING (true) WITH CHECK (true);
CREATE POLICY "ALL" ON "public"."payments" USING (true) WITH CHECK (true);
CREATE POLICY "ALL" ON "public"."rooms" USING (true) WITH CHECK (true);
CREATE POLICY "All" ON "public"."academic_periods" USING (true) WITH CHECK (true);
CREATE POLICY "All Action" ON "public"."dormitories" USING (true) WITH CHECK (true);
CREATE POLICY "All Action" ON "public"."fines" USING (true) WITH CHECK (true);
CREATE POLICY "All Action" ON "public"."profiles" USING (true) WITH CHECK (true);
CREATE POLICY "All Action" ON "public"."regular_charges" USING (true) WITH CHECK (true);
CREATE POLICY "All Action " ON "public"."dormitory_enrollment" USING (true) WITH CHECK (true);
CREATE POLICY "TRUE for ALL" ON "public"."event_payments" USING (true) WITH CHECK (true);
CREATE POLICY "Users can read own role" ON "public"."dormitory_roles" USING (true) WITH CHECK (true);
ALTER TABLE "public"."academic_periods" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "academic_periods_delete" ON "public"."academic_periods" FOR DELETE USING ("public"."is_super_admin"());
CREATE POLICY "academic_periods_insert" ON "public"."academic_periods" FOR INSERT WITH CHECK ("public"."is_super_admin"());
CREATE POLICY "academic_periods_select" ON "public"."academic_periods" FOR SELECT USING ("public"."is_active_user"());
CREATE POLICY "academic_periods_update" ON "public"."academic_periods" FOR UPDATE USING ("public"."is_super_admin"());
ALTER TABLE "public"."bills" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bills_insert" ON "public"."bills" FOR INSERT WITH CHECK (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "bills_select" ON "public"."bills" FOR SELECT USING (("public"."is_active_user"() AND (("dormer_id" = "auth"."uid"()) OR "public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "bills_update" ON "public"."bills" FOR UPDATE USING (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
ALTER TABLE "public"."clearance_certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dormitories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dormitory_enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dormitory_roles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dormitory_roles_delete" ON "public"."dormitory_roles" FOR DELETE USING (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "dormitory_roles_insert" ON "public"."dormitory_roles" FOR INSERT WITH CHECK (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "dormitory_roles_select" ON "public"."dormitory_roles" FOR SELECT USING (("public"."is_active_user"() AND (("user_id" = "auth"."uid"()) OR "public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "dormitory_roles_update" ON "public"."dormitory_roles" FOR UPDATE USING (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
ALTER TABLE "public"."event_payments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_payments_insert" ON "public"."event_payments" FOR INSERT WITH CHECK (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "event_payments_select" ON "public"."event_payments" FOR SELECT USING (("public"."is_active_user"() AND (("dormer_id" = "auth"."uid"()) OR "public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "event_payments_update" ON "public"."event_payments" FOR UPDATE USING (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_delete" ON "public"."events" FOR DELETE USING (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "events_insert" ON "public"."events" FOR INSERT WITH CHECK (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "events_select" ON "public"."events" FOR SELECT USING (("public"."is_active_user"() AND (("public"."my_dorm_role"("dormitory_id") IS NOT NULL) OR "public"."is_super_admin"())));
CREATE POLICY "events_update" ON "public"."events" FOR UPDATE USING (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_insert" ON "public"."expenses" FOR INSERT WITH CHECK (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "expenses_select" ON "public"."expenses" FOR SELECT USING (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
ALTER TABLE "public"."fine_impositions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."fines" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fines_insert" ON "public"."fine_impositions" FOR INSERT WITH CHECK (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "fines_select" ON "public"."fine_impositions" FOR SELECT USING (("public"."is_active_user"() AND (("dormer_id" = "auth"."uid"()) OR "public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "fines_update" ON "public"."fine_impositions" FOR UPDATE USING (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_insert" ON "public"."payments" FOR INSERT WITH CHECK (("public"."is_active_user"() AND ("public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
CREATE POLICY "payments_select" ON "public"."payments" FOR SELECT USING (("public"."is_active_user"() AND (("dormer_id" = "auth"."uid"()) OR "public"."is_dorm_staff"("dormitory_id") OR "public"."is_super_admin"())));
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."is_dorm_staff"(( SELECT "dormitory_roles"."dormitory_id"
   FROM "public"."dormitory_roles"
  WHERE ("dormitory_roles"."user_id" = "profiles"."id")
 LIMIT 1)) OR "public"."is_super_admin"()));
CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "public"."is_super_admin"())) WITH CHECK ((("id" = "auth"."uid"()) OR "public"."is_super_admin"()));
ALTER TABLE "public"."regular_charges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_active_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_active_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_active_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_dorm_staff"("dorm_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_dorm_staff"("dorm_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_dorm_staff"("dorm_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."my_dorm_role"("dorm_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."my_dorm_role"("dorm_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."my_dorm_role"("dorm_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";
GRANT ALL ON TABLE "public"."academic_periods" TO "anon";
GRANT ALL ON TABLE "public"."academic_periods" TO "authenticated";
GRANT ALL ON TABLE "public"."academic_periods" TO "service_role";
GRANT ALL ON TABLE "public"."bills" TO "anon";
GRANT ALL ON TABLE "public"."bills" TO "authenticated";
GRANT ALL ON TABLE "public"."bills" TO "service_role";
GRANT ALL ON TABLE "public"."clearance_certificates" TO "anon";
GRANT ALL ON TABLE "public"."clearance_certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."clearance_certificates" TO "service_role";
GRANT ALL ON TABLE "public"."dormitories" TO "anon";
GRANT ALL ON TABLE "public"."dormitories" TO "authenticated";
GRANT ALL ON TABLE "public"."dormitories" TO "service_role";
GRANT ALL ON TABLE "public"."dormitory_enrollment" TO "anon";
GRANT ALL ON TABLE "public"."dormitory_enrollment" TO "authenticated";
GRANT ALL ON TABLE "public"."dormitory_enrollment" TO "service_role";
GRANT ALL ON TABLE "public"."dormitory_roles" TO "anon";
GRANT ALL ON TABLE "public"."dormitory_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."dormitory_roles" TO "service_role";
GRANT ALL ON TABLE "public"."event_payments" TO "anon";
GRANT ALL ON TABLE "public"."event_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."event_payments" TO "service_role";
GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";
GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";
GRANT ALL ON TABLE "public"."fine_impositions" TO "anon";
GRANT ALL ON TABLE "public"."fine_impositions" TO "authenticated";
GRANT ALL ON TABLE "public"."fine_impositions" TO "service_role";
GRANT ALL ON TABLE "public"."fines" TO "anon";
GRANT ALL ON TABLE "public"."fines" TO "authenticated";
GRANT ALL ON TABLE "public"."fines" TO "service_role";
GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."regular_charges" TO "anon";
GRANT ALL ON TABLE "public"."regular_charges" TO "authenticated";
GRANT ALL ON TABLE "public"."regular_charges" TO "service_role";
GRANT ALL ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."rooms" TO "service_role";
GRANT ALL ON SEQUENCE "public"."rooms_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rooms_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rooms_id_seq" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
drop extension if exists "pg_net";
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
create policy "Enable read access for all users"
  on "storage"."buckets"
  as permissive
  for all
  to public
using (true)
with check (true);
create policy "Give anon users access to JPG images in folder 13hfyy5_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'receipt-images'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
create policy "Give anon users access to JPG images in folder 13hfyy5_1"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'receipt-images'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
create policy "Give anon users access to JPG images in folder 13hfyy5_2"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'receipt-images'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
create policy "Give anon users access to JPG images in folder 13hfyy5_3"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'receipt-images'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
