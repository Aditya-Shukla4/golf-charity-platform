import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
    return format(parseISO(date), 'dd MMM yyyy')
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

export function getSubscriptionPrice(plan: 'monthly' | 'yearly') {
    return plan === 'monthly' ? 999 : 9999
}

export function calculatePrizePools(
    activeSubscribers: number,
    poolSharePct: number = 0.5
) {
    const monthlyRevenue = activeSubscribers * 999
    const totalPool = monthlyRevenue * poolSharePct
    return {
        jackpot: totalPool * 0.4,
        fourMatch: totalPool * 0.35,
        threeMatch: totalPool * 0.25,
        total: totalPool,
    }
}

export function calculateCharityContribution(
    plan: 'monthly' | 'yearly',
    contributionPct: number
) {
    const price = getSubscriptionPrice(plan)
    return (price * contributionPct) / 100
}

// Draw engine — random
export function generateRandomDraw(): number[] {
    const numbers = new Set<number>()
    while (numbers.size < 5) {
        numbers.add(Math.floor(Math.random() * 45) + 1)
    }
    return Array.from(numbers).sort((a, b) => a - b)
}

// Draw engine — algorithmic (weighted by score frequency)
export function generateAlgorithmicDraw(
    allScoreSnapshots: number[][]
): number[] {
    const frequency: Record<number, number> = {}

    // Count frequency of each score across all entries
    allScoreSnapshots.flat().forEach(score => {
        frequency[score] = (frequency[score] || 0) + 1
    })

    // Build weighted pool — more frequent = more weight
    const weightedPool: number[] = []
    Object.entries(frequency).forEach(([score, count]) => {
        for (let i = 0; i < count; i++) {
            weightedPool.push(Number(score))
        }
    })

    // Pick 5 unique numbers from weighted pool
    const picked = new Set<number>()
    let attempts = 0
    while (picked.size < 5 && attempts < 1000) {
        const idx = Math.floor(Math.random() * weightedPool.length)
        picked.add(weightedPool[idx])
        attempts++
    }

    // Fill remaining with random if needed
    while (picked.size < 5) {
        picked.add(Math.floor(Math.random() * 45) + 1)
    }

    return Array.from(picked).sort((a, b) => a - b)
}

// Check how many numbers a user matched
export function checkMatchCount(
    userScores: number[],
    winningNumbers: number[]
): number {
    return userScores.filter(s => winningNumbers.includes(s)).length
}

export function getMatchTier(matchCount: number): 3 | 4 | 5 | null {
    if (matchCount >= 5) return 5
    if (matchCount === 4) return 4
    if (matchCount === 3) return 3
    return null
}