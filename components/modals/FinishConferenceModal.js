// components/modals/FinishConferenceModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Pressable, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedButton from '../common/AnimatedButton';

const FinishConferenceModal = ({ 
    visible, 
    onClose, 
    onConfirm, 
    title = "Finalizar Conferência", 
    message = "Deseja realmente finalizar a conferência? Todos os itens foram conferidos.", 
    confirmText = "Finalizar", 
    cancelText = "Cancelar", 
    isLoading = false
}) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [shouldRender, setShouldRender] = useState(visible);
    const [obs, setObs] = useState('');
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            setObs(''); // Limpa a observação ao abrir
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

    const handleConfirm = () => {
        onConfirm(obs);
    };

    if (!shouldRender) return null;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={shouldRender}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <Animated.View style={[styles.overlayContent, { opacity: modalOpacity }]}>
                        <Pressable style={styles.overlayPressable} onPress={onClose}>
                            <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                                <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
                                    
                                    <Text style={styles.title}>{title}</Text>
                                    <Text style={styles.message}>{message}</Text>

                                    <Text style={styles.label}>Observação Final (Opcional):</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={obs}
                                        onChangeText={setObs}
                                        placeholder="Ex: Conferência finalizada com sucesso."
                                        placeholderTextColor={colors.textLight}
                                        multiline
                                        maxLength={255}
                                    />

                                    <View style={styles.buttonContainer}>
                                        <AnimatedButton 
                                            style={[styles.button, styles.confirmButton]} 
                                            onPress={handleConfirm}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color={colors.white} size="small" />
                                            ) : (
                                                <Text style={styles.confirmButtonText}>{confirmText}</Text>
                                            )}
                                        </AnimatedButton>

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
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayContent: {
        flex: 1,
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
        width: '90%', 
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
        fontSize: 22, 
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textLight,
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 24, 
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: 14,
        color: colors.text,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4
    },
    input: {
        width: '100%',
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: colors.text,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 25,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
        flexDirection: 'column',
    },
    button: {
        width: '100%',
        paddingVertical: 16, 
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: colors.success, // Verde sucesso para finalizar
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

export default FinishConferenceModal;