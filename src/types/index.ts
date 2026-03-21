export type UserRole = 'subscriber' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type DrawStatus = 'pending' | 'simulated' | 'published'
export type DrawType = 'random' | 'algorithmic'
export type WinnerStatus = 'pending' | 'proof_submitted' | 'verified' | 'rejected' | 'paid'

export interface User {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: UserRole
    created_at: string
}

export interface Subscription {
    id: string
    user_id: string
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    plan: SubscriptionPlan
    status: SubscriptionStatus
    current_period_end: string | null
    created_at: string
}

export interface GolfScore {
    id: string
    user_id: string
    score: number
    played_on: string
    created_at: string
}

export interface Charity {
    id: string
    name: string
    description: string | null
    image_url: string | null
    website_url: string | null
    is_featured: boolean
    is_active: boolean
    created_at: string
}

export interface UserCharitySelection {
    id: string
    user_id: string
    charity_id: string
    contribution_pct: number
    selected_at: string
    charity?: Charity
}

export interface Draw {
    id: string
    month_year: string
    winning_numbers: number[] | null
    status: DrawStatus
    draw_type: DrawType
    jackpot_pool: number
    four_match_pool: number
    three_match_pool: number
    jackpot_rolled_over: boolean
    drawn_at: string | null
    published_at: string | null
    created_at: string
}

export interface DrawEntry {
    id: string
    draw_id: string
    user_id: string
    score_snapshot: number[]
    entered_at: string
}

export interface Winner {
    id: string
    draw_id: string
    user_id: string
    match_count: 3 | 4 | 5
    prize_amount: number
    status: WinnerStatus
    proof_url: string | null
    verified_at: string | null
    paid_at: string | null
    created_at: string
    user?: User
    draw?: Draw
}

export interface PrizePoolConfig {
    id: string
    five_match_pct: number
    four_match_pct: number
    three_match_pct: number
    subscription_pool_share: number
    updated_at: string
}