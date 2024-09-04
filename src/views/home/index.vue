<template>
  <div>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="Amount">
        <el-input-number v-model="form.amount" :min="1" />
      </el-form-item>
      <el-form-item>
        <div id="card-element"></div>
        <!-- 确保包含这个挂载点 -->
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">Pay</el-button>
      </el-form-item>
    </el-form>

    <div v-if="errorMessage" style="color: red">{{ errorMessage }}</div>
    <div v-if="successMessage" style="color: green">{{ successMessage }}</div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js'
import api from '@/utils/api'

const stripe = ref<Stripe | null>(null)
const cardElement = ref<StripeCardElement | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  stripe.value = await loadStripe('pk_test_51OcNXgHtSLQYLWn7Oo1p4gjWkFFNUaG4iW0mZlluKVgywbKXLI8grZ2HIkQFw3c6r3XSrWDAamanV9pXYAIsXqHq00gYPudVgi')
  const elements: StripeElements = stripe.value!.elements()
  cardElement.value = elements.create('card', {
    style: {
      base: {
        color: '#ffffff',
        '::placeholder': {
          color: '#ffffff',
        },
      },
    },
  })
  cardElement.value.mount('#card-element')
})

async function handleSubmit() {
  if (!cardElement.value) {
    errorMessage.value = 'Card element is not mounted.'
    return
  }

  try {
    const { result } = await api.get('/mgn/tradingOrder/recharge', {
      amount: form.amount, // 转换为分
    })

    const { error, paymentIntent } = await stripe.value!.confirmCardPayment(result, {
      payment_method: {
        card: cardElement.value!,
      },
    })

    if (error) {
      errorMessage.value = error.message!
    } else if (paymentIntent!.status === 'succeeded') {
      successMessage.value = 'Payment successful!'
    }
  } catch (err) {
    errorMessage.value = 'Payment failed! ' + err.message
  }
}

// do not use same name with ref
const form = reactive({
  amount: 0,
})
</script>

<style scoped>
#card-element {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  width: 100%;
  color: white;
  width: 100%;
}
</style>
