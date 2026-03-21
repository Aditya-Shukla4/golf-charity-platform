// Mock payment system — replace with real Stripe when available

export interface MockPaymentResult {
    success: boolean
    subscriptionId: string
    customerId: string
    error?: string
}

export async function mockCreateSubscription(
    userId: string,
    plan: 'monthly' | 'yearly',
    _cardDetails: {
        number: string
        expiry: string
        cvv: string
    }
): Promise<MockPaymentResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate card validation
    if (_cardDetails.number.replace(/\s/g, '').length < 16) {
        return { success: false, subscriptionId: '', customerId: '', error: 'Invalid card number' }
    }

    return {
        success: true,
        subscriptionId: `mock_sub_${userId}_${Date.now()}`,
        customerId: `mock_cus_${userId}`,
    }
}

export async function mockCancelSubscription(
    _subscriptionId: string
): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return { success: true }
}