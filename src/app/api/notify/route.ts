import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { type, userId, data } = await request.json()

    const { data: user } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const templates: Record<string, { subject: string; body: string }> = {
        subscription_activated: {
            subject: 'Welcome to GolfGives!',
            body: `Hi ${user.full_name || 'Golfer'},\n\nYour ${data?.plan} subscription is now active!\n\nStart logging your scores and enter the next monthly draw.\n\nGolfGives Team`,
        },
        draw_published: {
            subject: `GolfGives Draw Results — ${data?.month}`,
            body: `Hi ${user.full_name || 'Golfer'},\n\nThe ${data?.month} draw results are in!\n\nWinning numbers: ${data?.numbers?.join(', ')}\n\nLog in to check if you won.\n\nGolfGives Team`,
        },
        winner_verified: {
            subject: 'Your prize has been verified!',
            body: `Hi ${user.full_name || 'Golfer'},\n\nCongratulations! Your prize of ${data?.amount} has been verified.\n\nPayment will be processed shortly.\n\nGolfGives Team`,
        },
        winner_paid: {
            subject: 'Your prize has been paid!',
            body: `Hi ${user.full_name || 'Golfer'},\n\nYour prize of ${data?.amount} has been paid!\n\nThank you for playing GolfGives.\n\nGolfGives Team`,
        },
    }

    const template = templates[type]
    if (!template) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    // Log notification (in production replace with real email service like Resend)
    console.log(`Email to ${user.email}: ${template.subject}`)
    console.log(template.body)

    return NextResponse.json({ success: true, email: user.email, subject: template.subject })
}