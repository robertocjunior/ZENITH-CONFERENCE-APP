// components/modals/ItemConferenceModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../common/AnimatedButton';

const ItemConferenceModal = ({ visible, onClose, onConfirm, item }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [shouldRender, setShouldRender] = useState(visible);
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.parallel([
                Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(modalScale, { toValue: 1, friction: 6, useNativeDriver: true })
            ]).start();
        } else {
            Animated.parallel([
                 Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                 Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setShouldRender(false);
            });
        }
    }, [visible]);

    if (!shouldRender || !item) return null;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={shouldRender}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <Animated.View style={[styles.overlay, { opacity: modalOpacity }]}>
                <Pressable style={styles.overlayPressable} onPress={onClose}>
                    <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                        <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
                            
                            {/* Cabeçalho do Modal */}
                            <View style={styles.header}>
                                <Text style={styles.title}>Conferência de Item</Text>
                                <AnimatedButton onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={colors.textLight} />
                                </AnimatedButton>
                            </View>

                            {/* Detalhes do Item */}
                            <View style={styles.itemDetails}>
                                <Text style={styles.description}>{item.descricao}</Text>
                                
                                <View style={styles.badgesRow}>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeLabel}>CÓDIGO</Text>
                                        <Text style={styles.badgeValue}>{item.codigo_produto}</Text>
                                    </View>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeLabel}>EAN</Text>
                                        <Text style={styles.badgeValue}>{item.referencia || '-'}</Text>
                                    </View>
                                </View>

                                <View style={styles.qtyBox}>
                                    <Text style={styles.qtyLabel}>QUANTIDADE A CONFERIR</Text>
                                    <Text style={styles.qtyValue}>
                                        {item.quantidade} <Text style={styles.qtyUnit}>{item.unidade}</Text>
                                    </Text>
                                </View>
                            </View>

                            {/* Botões de Ação */}
                            <View style={styles.buttonRow}>
                                <AnimatedButton 
                                    style={[styles.button, styles.cancelButton]} 
                                    onPress={onClose}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </AnimatedButton>

                                <AnimatedButton 
                                    style={[styles.button, styles.confirmButton]} 
                                    onPress={() => onConfirm(item)}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} style={{marginRight: 5}}/>
                                    <Text style={styles.confirmButtonText}>Conferir</Text>
                                </AnimatedButton>
                            </View>

                        </Animated.View>
                    </Pressable>
                </Pressable>
            </Animated.View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayPressable: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 360,
    },
    modalContent: {
        backgroundColor: colors.cardBackground,
        borderRadius: SIZES.radius,
        padding: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    closeButton: {
        padding: 5,
    },
    itemDetails: {
        marginBottom: 25,
        gap: 15,
    },
    description: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        lineHeight: 22,
    },
    badgesRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    badge: {
        backgroundColor: colors.inputBackground,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    badgeLabel: {
        fontSize: 10,
        color: colors.textLight,
        fontWeight: 'bold',
    },
    badgeValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    qtyBox: {
        backgroundColor: colors.background, // Destaque suave
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    qtyLabel: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    qtyValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
    },
    qtyUnit: {
        fontSize: 16,
        color: colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    cancelButton: {
        backgroundColor: colors.buttonSecondaryBackground,
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    cancelButtonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 16,
    },
    confirmButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ItemConferenceModal;