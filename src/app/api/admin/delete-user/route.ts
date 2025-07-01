import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Delete user API called')
    
    // Verificar se as variáveis de ambiente existem
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
      url: supabaseUrl?.substring(0, 20) + '...'
    })

    const supabaseAdmin = createSupabaseAdmin()
    console.log('Supabase admin client created successfully')

    const { userId } = await request.json()
    console.log('User ID to delete:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Primeiro, marcar como deletado na tabela profiles
    console.log('Attempting to update profile status...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'deleted' })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json({ error: 'Failed to update profile: ' + profileError.message }, { status: 500 })
    }

    console.log('Profile updated successfully, now deleting from auth...')

    // Depois, deletar do Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting from auth:', authError)
      // Reverter o status do profile se falhar
      console.log('Reverting profile status...')
      await supabaseAdmin
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId)
      return NextResponse.json({ error: 'Failed to delete from authentication: ' + authError.message }, { status: 500 })
    }

    console.log('User deleted successfully from both profile and auth')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}