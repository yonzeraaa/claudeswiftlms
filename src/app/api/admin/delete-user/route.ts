import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Primeiro, marcar como deletado na tabela profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'deleted' })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Depois, deletar do Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting from auth:', authError)
      // Reverter o status do profile se falhar
      await supabaseAdmin
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId)
      return NextResponse.json({ error: 'Failed to delete from authentication' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}