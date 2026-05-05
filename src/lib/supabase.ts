import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadPdf(buffer: Buffer, fileName: string) {
  const { error } = await supabase.storage
    .from('research-pdfs')
    .upload(fileName, buffer, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) {
    console.error('Supabase Storage Error:', error)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('research-pdfs')
    .getPublicUrl(fileName)

  return publicUrl
}
