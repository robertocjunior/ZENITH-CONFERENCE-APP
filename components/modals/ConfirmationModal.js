// components/modals/ConfirmationModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import AnimatedButton from '../common/AnimatedButton';

const ConfirmationModal = ({ 
    visible, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirmar", 
    cancelText = "Cancelar", 
    isLoading = false,
    confirmColor = null 
}) => {
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

    if (!shouldRender) return null;

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
                            
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>

                            <View style={styles.buttonContainer}>
                                {/* Botão Principal (Ação) */}
                                <AnimatedButton 
                                    style={[
                                        styles.button, 
                                        styles.confirmButton, 
                                        confirmColor && { backgroundColor: confirmColor }
                                    ]} 
                                    onPress={onConfirm}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={colors.white} size="small" />
                                    ) : (
                                        <Text style={styles.confirmButtonText}>{confirmText}</Text>
                                    )}
                                </AnimatedButton>

                                {/* Botão Secundário (Cancelar) */}
                                <AnimatedButton 
                                    style={[styles.button, styles.cancelButton]} 
                                    onPress={onClose}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
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
    },
    modalContainer: {
        // AUMENTADO: Agora ocupa 90% da largura da tela
        width: '90%', 
        // AUMENTADO: Aumentei o limite máximo para telas maiores (tablets)
        maxWidth: 400, 
    },
    modalContent: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: 25,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        alignItems: 'center',
    },
    title: {
        fontSize: 22, // Levemente maior
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 30,
        textAlign: 'center',
        lineHeight: 24, // Melhor leitura
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
        flexDirection: 'column',
    },
    button: {
        width: '100%',
        paddingVertical: 16, // Botões um pouco mais altos para facilitar o toque
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: colors.primary,
        elevation: 2,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    confirmButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButtonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ConfirmationModal;