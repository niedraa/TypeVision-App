import { StripeBackend } from './StripeBackend';
import { Platform } from 'react-native';

// Configuration Stripe
export const STRIPE_CONFIG = {
  // Clé publique (vous devrez la remplacer par votre clé publique Stripe)
  publishableKey: 'pk_live_...', // À remplacer par votre clé publique
};

// Service pour récupérer les produits Stripe
export class StripeService {
  static async getProducts() {
    return await StripeBackend.getProducts();
  }

  static async getPrices() {
    return await StripeBackend.getPrices();
  }

  static async getProductsWithPrices() {
    try {
      const [products, prices] = await Promise.all([
        this.getProducts(),
        this.getPrices()
      ]);

      // Associer les prix aux produits
      const productsWithPrices = products.map(product => {
        const productPrices = prices.filter(price => price.product === product.id);
        const defaultPrice = productPrices.find(price => price.active) || productPrices[0];
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images || [],
          metadata: product.metadata || {},
          price: defaultPrice ? {
            id: defaultPrice.id,
            amount: defaultPrice.unit_amount,
            currency: defaultPrice.currency,
            formatted: this.formatPrice(defaultPrice.unit_amount, defaultPrice.currency)
          } : null,
          active: product.active
        };
      });

      return productsWithPrices.filter(product => product.active && product.price);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits avec prix:', error);
      return [];
    }
  }

  static formatPrice(amount, currency) {
    if (!amount) return 'Gratuit';
    
    const price = amount / 100; // Stripe stocke les montants en centimes
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);
  }

  static async createCheckoutSession(priceId) {
    console.log('🔥 DEBUT createCheckoutSession avec priceId:', priceId);
    
    try {
      // URLs de retour - toujours définies pour éviter l'erreur Stripe
      let successUrl, cancelUrl;
      
      try {
        // Tenter de détecter l'environnement web
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
          // Environnement web
          const currentUrl = window.location.origin;
          successUrl = `${currentUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
          cancelUrl = `${currentUrl}/cancel`;
          console.log('🌐 Environnement web détecté:', currentUrl);
        } else {
          throw new Error('Pas d\'environnement web');
        }
      } catch (error) {
        // Environnement mobile ou erreur - utiliser des URLs fixes
        successUrl = 'https://typevision.app/success?session_id={CHECKOUT_SESSION_ID}';
        cancelUrl = 'https://typevision.app/cancel';
        console.log('📱 Environnement mobile détecté - URLs fixes utilisées');
      }

      console.log('🔗 URLs utilisées:', { successUrl, cancelUrl });
      
      const session = await StripeBackend.createCheckoutSession(priceId, successUrl, cancelUrl);
      console.log('✅ Session créée avec succès');
      return session;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la session:', error);
      throw error;
    }
  }

  static async createPaymentIntent(amount, currency = 'eur', productInfo = {}) {
    try {
      const metadata = {
        product_name: productInfo.name || '',
        product_id: productInfo.id || '',
        app: 'TypeVision'
      };

      return await StripeBackend.createPaymentIntent(amount, currency, metadata);
    } catch (error) {
      console.error('Erreur lors de la création du payment intent:', error);
      throw error;
    }
  }
}
