// components/common/SuccessModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from './AnimatedButton';

const AUTO_CLOSE_DURATION = 2000; // 2 segundos para fechar

const SuccessModal = ({ visible, title, message, onClose }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [shouldRender, setShouldRender] = useState(visible);
    
    // Animações
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let timerAnimation;

        if (visible) {
            setShouldRender(true);
            progress.setValue(0);

            // 1. Entrada
            Animated.parallel([
                Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(modalScale, { toValue: 1, friction: 6, useNativeDriver: true })
            ]).start();

            // 2. Timer Barra de Progresso
            timerAnimation = Animated.timing(progress, {
                toValue: 1,
                duration: AUTO_CLOSE_DURATION,
                easing: Easing.linear,
                useNativeDriver: false 
            });

            timerAnimation.start(({ finished }) => {
                if (finished) {
                    handleClose();
                }
            });

        } else {
            // Saída
            Animated.parallel([
                 Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                 Animated.timing(modalScale, { toValue: 0.9, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setShouldRender(false);
            });
        }

        return () => {
            if (timerAnimation) timerAnimation.stop();
        };
    }, [visible]);

    const handleClose = () => {
        progress.stopAnimation(); 
        onClose && onClose();
    };

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    if (!shouldRender) return null;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={shouldRender}
            onRequestClose={handleClose}
            statusBarTranslucent={true}
        >
            <Animated.View style={[styles.overlay, { opacity: modalOpacity }]}>
                <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
                    
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                    </View>
                    
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    
                    <View style={styles.buttonRow}>
                        <AnimatedButton 
                            style={styles.button} 
                            onPress={handleClose}
                            activeOpacity={0.9}
                        >
                            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                            <Text style={styles.buttonText}>OK</Text>
                        </AnimatedButton>
                    </View>
                </Animated.View>
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
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    iconContainer: {
        marginBottom: 15,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    buttonRow: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: colors.success, // Borda verde para combinar
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.success,
        opacity: 0.2, // Fundo verde claro preenchendo
    },
    buttonText: {
        color: colors.success, // Texto verde
        fontSize: 16,
        fontWeight: 'bold',
        zIndex: 1,
    },
});

export default SuccessModal;