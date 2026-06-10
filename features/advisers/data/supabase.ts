import { createClient } from "@/lib/supabase/client";
import type { Adviser, CreateAdviserInput, UpdateAdviserInput } from "./types";

const supabase = createClient()

export async function list(): Promise<Adviser[]> {
 // TO DO for Norman  
 return []
}

export async function listForDormitory(dormitoryId: string): Promise<Adviser[]> {
 // TO DO for Norman  
 return [] 
}

export async function getById(id: string): Promise<Adviser | null> {
 // TO DO for Norman   
    return null
}

export async function create(input: CreateAdviserInput): Promise<Adviser | void> {
 // TO DO for Norman   
}

export async function update(input: UpdateAdviserInput): Promise<Adviser | void> {
 // TO DO for Norman   
}

export async function remove(id: string): Promise<void> {
 // TO DO for Norman   
}