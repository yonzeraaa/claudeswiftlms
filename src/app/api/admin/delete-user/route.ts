import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
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
      return NextResponse.json({ error: 'Failed to update profile: ' + profileError.message }, { status: 500 })
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
      return NextResponse.json({ error: 'Failed to delete from authentication: ' + authError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}