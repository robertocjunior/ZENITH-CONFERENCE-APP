// components/modals/ConfirmationModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';
import AnimatedButton from '../common/AnimatedButton';

const ConfirmationModal = ({ visible, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", isLoading = false }) => {
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

                            <View style={styles.buttonRow}>
                                <AnimatedButton 
                                    style={[styles.button, styles.cancelButton]} 
                                    onPress={onClose}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                                </AnimatedButton>

                                <AnimatedButton 
                                    style={[styles.button, styles.confirmButton]} 
                                    onPress={onConfirm}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        {isLoading ? "Aguarde..." : confirmText}
                                    </Text>
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
        maxWidth: 340,
    },
    modalContent: {
        backgroundColor: colors.cardBackground,
        borderRadius: SIZES.radius,
        padding: 25,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 25,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ConfirmationModal;