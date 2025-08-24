// Backend minimal pour gérer Stripe de manière sécurisée
// ⚠️ ATTENTION: Ce code est prévu pour un vrai backend, pas pour production côté client

const STRIPE_SECRET_KEY = 'sk_live_votre_cle_secrete_ici';
const STRIPE_API_URL = 'https://api.stripe.com/v1';

export class StripeBackend {
  static async makeStripeRequest(endpoint, method = 'GET', body = null) {
    const url = `${STRIPE_API_URL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    if (body && method !== 'GET') {
      if (body instanceof URLSearchParams) {
        options.body = body.toString();
        console.log('🔄 Corps URLSearchParams final:', options.body);
      } else {
        // Conversion manuelle des objets en format form-data pour Stripe API
        const formData = new URLSearchParams();
        
        const flattenObject = (obj, prefix = '') => {
          for (const [key, value] of Object.entries(obj)) {
            const formKey = prefix ? `${prefix}[${key}]` : key;
            
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                  flattenObject(item, `${formKey}[${index}]`);
                } else {
                  formData.append(`${formKey}[${index}]`, item);
                }
              });
            } else if (typeof value === 'object' && value !== null) {
              flattenObject(value, formKey);
            } else {
              formData.append(formKey, value);
            }
          }
        };
        
        flattenObject(body);
        options.body = formData.toString();
        console.log('🔄 Corps de la requête final:', options.body);
      }
    }

    try {
      console.log('🌐 Envoi requête à:', url);
      console.log('🔧 Options:', JSON.stringify(options, null, 2));
      
      const response = await fetch(url, options);
      
      console.log('📡 Statut réponse:', response.status);
      console.log('📋 Headers réponse:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur détaillée Stripe:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.error?.message || 'Erreur Stripe');
      }

      const result = await response.json();
      console.log('✅ Réponse Stripe réussie:', result);
      return result;
    } catch (error) {
      console.error('Erreur requête Stripe:', error);
      throw error;
    }
  }

  static async getProducts() {
    try {
      const data = await this.makeStripeRequest('/products?active=true&limit=20');
      return data.data || [];
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return [];
    }
  }

  static async getPrices() {
    try {
      const data = await this.makeStripeRequest('/prices?active=true&limit=50');
      return data.data || [];
    } catch (error) {
      console.error('Erreur récupération prix:', error);
      return [];
    }
  }

  static async createCheckoutSession(priceId, successUrl, cancelUrl) {
    console.log('🎯 BACKEND - Création session Stripe:', { priceId, successUrl, cancelUrl });
    
    try {
      if (!successUrl || !cancelUrl) {
        console.error('❌ URLs de retour manquantes:', { successUrl, cancelUrl });
        throw new Error('URLs de retour manquantes');
      }
      
      // Utilisons directement URLSearchParams au lieu de la conversion complexe
      const params = new URLSearchParams();
      params.append('line_items[0][price]', priceId);
      params.append('line_items[0][quantity]', '1');
      params.append('mode', 'payment');
      params.append('success_url', successUrl);
      params.append('cancel_url', cancelUrl);
      params.append('payment_method_types[0]', 'card');
      params.append('billing_address_collection', 'required');

      console.log('📋 Paramètres Stripe directs:', params.toString());
      
      const session = await this.makeStripeRequest('/checkout/sessions', 'POST', params);
      console.log('✅ Session créée avec succès:', session.id);
      return session;
    } catch (error) {
      console.error('Erreur création session:', error);
      throw error;
    }
  }

  static async getCustomer(customerId) {
    try {
      return await this.makeStripeRequest(`/customers/${customerId}`);
    } catch (error) {
      console.error('Erreur récupération customer:', error);
      throw error;
    }
  }

  static async createPaymentIntent(amount, currency = 'eur', metadata = {}) {
    try {
      const params = new URLSearchParams({
        amount: amount.toString(),
        currency,
        'automatic_payment_methods[enabled]': 'true',
        ...Object.entries(metadata).reduce((acc, [key, value]) => {
          acc[`metadata[${key}]`] = value;
          return acc;
        }, {})
      });

      return await this.makeStripeRequest('/payment_intents', 'POST', params);
    } catch (error) {
      console.error('Erreur création payment intent:', error);
      throw error;
    }
  }
}
