import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { StripeService } from './services/StripeService';
import { AnimatedButton } from './components/AnimatedButton';

export default function ShopScreen({ onBack }) {
  const [selectedTab, setSelectedTab] = useState('Skins');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const stripeProducts = await StripeService.getProductsWithPrices();
      console.log('Produits Stripe récupérés:', stripeProducts);
      setProducts(stripeProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product) => {
    try {
      setPurchasing(product.id);
      
      if (!product.price?.id) {
        Alert.alert('Erreur', 'Prix non disponible pour ce produit');
        return;
      }

      // Créer une session de paiement Stripe
      const session = await StripeService.createCheckoutSession(product.price.id);
      
      if (session.url) {
        // Vérifier l'environnement pour la redirection
        if (typeof window !== 'undefined' && window.location) {
          // Environnement web - ouvrir dans un nouvel onglet
          window.open(session.url, '_blank');
        } else {
          // Environnement mobile - utiliser Linking pour ouvrir le navigateur
          try {
            const supported = await Linking.canOpenURL(session.url);
            if (supported) {
              await Linking.openURL(session.url);
            } else {
              Alert.alert('Erreur', 'Impossible d\'ouvrir la page de paiement');
            }
          } catch (linkingError) {
            console.error('Erreur Linking:', linkingError);
            Alert.alert(
              'Paiement',
              `Copiez ce lien pour procéder au paiement :\n\n${session.url}`,
              [{ text: 'OK' }]
            );
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      Alert.alert('Erreur', 'Impossible de procéder au paiement');
    } finally {
      setPurchasing(null);
    }
  };

  const getProductIcon = (product) => {
    const metadata = product.metadata || {};
    const productType = metadata.type || 'default';
    
    switch (productType.toLowerCase()) {
      case 'skin':
      case 'keyboard':
        return renderKeyboardIcon(metadata.color || '#4A5568');
      case 'theme':
        return renderThemeIcon(metadata.color || '#4299E1');
      case 'premium':
      case 'unlock':
        return renderPremiumIcon();
      default:
        return renderDefaultIcon();
    }
  };

  const renderKeyboardIcon = (color) => (
    <View style={styles.keyboardIcon}>
      <View style={[styles.keyRow, { backgroundColor: color }]}>
        <View style={styles.key} />
        <View style={styles.key} />
        <View style={styles.key} />
        <View style={styles.key} />
      </View>
      <View style={[styles.keyRow, { backgroundColor: color }]}>
        <View style={styles.key} />
        <View style={styles.key} />
        <View style={styles.key} />
      </View>
      <View style={[styles.keyRow, { backgroundColor: color }]}>
        <View style={styles.spaceKey} />
      </View>
    </View>
  );

  const renderThemeIcon = (color) => (
    <View style={[styles.themeIcon, { backgroundColor: color }]}>
      <View style={styles.themeDot} />
      <View style={styles.themeDot} />
      <View style={styles.themeDot} />
    </View>
  );

  const renderPremiumIcon = () => (
    <View style={styles.premiumIcon}>
      <View style={styles.crownTop} />
      <View style={styles.crownBase} />
      <View style={styles.gem} />
    </View>
  );

  const renderDefaultIcon = () => (
    <View style={styles.defaultIcon}>
      <Text style={styles.defaultIconText}>?</Text>
    </View>
  );

  const renderProductItem = (product) => (
    <View key={product.id} style={styles.shopItem}>
      <View style={[styles.itemIcon, { backgroundColor: '#F7FAFC' }]}>
        {getProductIcon(product)}
      </View>
      <Text style={styles.itemName}>{product.name}</Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {product.description}
      </Text>
      <Text style={styles.itemPrice}>
        {product.price?.formatted || 'Prix non disponible'}
      </Text>
      <AnimatedButton 
        style={[styles.purchaseButton, purchasing === product.id && styles.purchaseButtonDisabled]}
        onPress={() => handlePurchase(product)}
        disabled={purchasing === product.id}
      >
        {purchasing === product.id ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.purchaseButtonText}>Acheter</Text>
        )}
      </AnimatedButton>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Shop</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C3E50" />
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedButton onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </AnimatedButton>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <AnimatedButton 
          style={[styles.tab, selectedTab === 'Skins' && styles.activeTab]}
          onPress={() => setSelectedTab('Skins')}
        >
          <Text style={[styles.tabText, selectedTab === 'Skins' && styles.activeTabText]}>
            Skins
          </Text>
        </AnimatedButton>
        <AnimatedButton 
          style={[styles.tab, selectedTab === 'Levels' && styles.activeTab]}
          onPress={() => setSelectedTab('Levels')}
        >
          <Text style={[styles.tabText, selectedTab === 'Levels' && styles.activeTabText]}>
            Levels
          </Text>
        </AnimatedButton>
      </View>

      {/* Shop Items */}
      <ScrollView style={styles.content}>
        <View style={styles.itemsContainer}>
          {products.length > 0 ? (
            products.map(renderProductItem)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Aucun produit disponible</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={loadProducts}>
                <Text style={styles.refreshButtonText}>Actualiser</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Restore Purchases Button */}
        {products.length > 0 && (
          <TouchableOpacity style={styles.restoreButton}>
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    minHeight: '100vh', // Safari fix
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    WebkitBoxAlign: 'center', // Safari fix
    WebkitBoxPack: 'justify', // Safari fix
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    WebkitBoxAlign: 'center', // Safari fix
    WebkitBoxPack: 'center', // Safari fix
  },
  backButtonText: {
    fontSize: 24,
    color: '#2C3E50',
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    flexShrink: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    marginBottom: 30,
    WebkitBoxOrient: 'horizontal', // Safari fix
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
    WebkitBoxAlign: 'center', // Safari fix
    WebkitBorderRadius: 20, // Safari fix
    border: 'none',
    outline: 'none',
  },
  activeTab: {
    backgroundColor: '#CBD5E0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    WebkitOverflowScrolling: 'touch', // Safari smooth scrolling
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    WebkitBoxOrient: 'horizontal', // Safari fix
    WebkitFlexWrap: 'wrap', // Safari fix
  },
  shopItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    WebkitBoxAlign: 'center', // Safari fix
    WebkitBorderRadius: 20, // Safari fix
    // Simplified shadow for Safari
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    WebkitBoxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  itemIcon: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    WebkitBorderRadius: 10, // Safari fix
    WebkitBoxAlign: 'center', // Safari fix
    WebkitBoxPack: 'center', // Safari fix
    position: 'relative',
  },
  keyboardIcon: {
    width: 60,
    height: 40,
    position: 'relative',
  },
  keyRow: {
    flexDirection: 'row',
    marginBottom: 2,
    borderRadius: 2,
    padding: 2,
    WebkitBorderRadius: 2, // Safari fix
    WebkitBoxOrient: 'horizontal', // Safari fix
  },
  key: {
    width: 8,
    height: 6,
    backgroundColor: '#E2E8F0',
    marginRight: 2,
    borderRadius: 1,
    WebkitBorderRadius: 1, // Safari fix
  },
  spaceKey: {
    width: 40,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
    WebkitBorderRadius: 1, // Safari fix
  },
  lockIcon: {
    position: 'relative',
    width: 30,
    height: 30,
  },
  lockBody: {
    width: 30,
    height: 20,
    backgroundColor: '#2D3748',
    borderRadius: 4,
    marginTop: 10,
    WebkitBorderRadius: 4, // Safari fix
    position: 'absolute',
    bottom: 0,
  },
  lockShackle: {
    width: 20,
    height: 15,
    borderWidth: 3,
    borderColor: '#2D3748',
    borderRadius: 10,
    position: 'absolute',
    top: 0,
    left: 5,
    borderBottomWidth: 0,
    borderStyle: 'solid',
    WebkitBorderRadius: 10, // Safari fix
    backgroundColor: 'transparent',
  },
  lockKeyhole: {
    width: 4,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    position: 'absolute',
    top: 20,
    left: 13,
    WebkitBorderRadius: 2, // Safari fix
  },
  mountainIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    WebkitBoxOrient: 'horizontal', // Safari fix
    WebkitBoxAlign: 'end', // Safari fix
  },
  mountain1: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginRight: -10,
  },
  mountain2: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
    textAlign: 'center',
    minHeight: 32,
  },
  itemPrice: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },
  purchaseButton: {
    backgroundColor: '#4299E1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
    WebkitBorderRadius: 15,
    WebkitBoxAlign: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    WebkitBoxAlign: 'center',
    WebkitBoxPack: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    width: '100%',
    WebkitBoxAlign: 'center',
    WebkitBoxPack: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#718096',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#4299E1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    WebkitBorderRadius: 20,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Icônes personnalisées
  themeIcon: {
    width: 50,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    WebkitBorderRadius: 8,
    WebkitBoxAlign: 'center',
    WebkitBoxPack: 'center',
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
    WebkitBorderRadius: 4,
  },
  premiumIcon: {
    position: 'relative',
    width: 40,
    height: 35,
  },
  crownTop: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 20,
    height: 15,
    backgroundColor: '#F6D55C',
    borderRadius: 10,
    WebkitBorderRadius: 10,
  },
  crownBase: {
    position: 'absolute',
    bottom: 0,
    left: 5,
    width: 30,
    height: 20,
    backgroundColor: '#F6D55C',
    borderRadius: 4,
    WebkitBorderRadius: 4,
  },
  gem: {
    position: 'absolute',
    top: 5,
    left: 17,
    width: 6,
    height: 6,
    backgroundColor: '#E53E3E',
    borderRadius: 3,
    WebkitBorderRadius: 3,
  },
  defaultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    WebkitBorderRadius: 20,
    WebkitBoxAlign: 'center',
    WebkitBoxPack: 'center',
  },
  defaultIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  restoreButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    WebkitBorderRadius: 25, // Safari fix
    WebkitBoxAlign: 'center', // Safari fix
    // Simplified shadow for Safari
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    WebkitBoxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: 'none',
    outline: 'none',
  },
  restoreButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
});
