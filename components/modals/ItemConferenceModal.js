// components/modals/ItemConferenceModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedButton from '../common/AnimatedButton';
import { Ionicons } from '@expo/vector-icons';

const ItemConferenceModal = ({ visible, item, onClose, onConfirm }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    
    // Estados
    const [step, setStep] = useState('quantity'); // 'quantity' ou 'observation'
    const [quantity, setQuantity] = useState('');
    const [observation, setObservation] = useState('');
    const quantityInputRef = useRef(null);
    const obsInputRef = useRef(null);

    // Resetar estados quando o modal abre ou o item muda
    useEffect(() => {
        if (visible && item) {
            setStep('quantity');
            setQuantity(''); // Começa vazio para o usuário digitar
            setObservation('');
            
            // Focar no input de quantidade automaticamente após um breve delay para a animação do modal
            setTimeout(() => {
                quantityInputRef.current?.focus();
            }, 100);
        }
    }, [visible, item]);

    const handleQuantityConfirm = () => {
        const inputQty = parseFloat(quantity.replace(',', '.'));
        const expectedQty = parseFloat(item?.quantidade || 0);

        if (isNaN(inputQty)) {
            alert("Por favor, digite uma quantidade válida.");
            return;
        }

        // Verifica divergência
        if (inputQty !== expectedQty) {
            // Se divergir, vai para o passo da observação
            setStep('observation');
            // Foca na observação
            setTimeout(() => {
                obsInputRef.current?.focus();
            }, 100);
        } else {
            // Se bater, finaliza sem observação
            onConfirm(item, inputQty, null);
        }
    };

    const handleFinalConfirm = () => {
        if (!observation || observation.trim() === '') {
            alert("Por favor, informe o motivo da divergência.");
            return;
        }
        const inputQty = parseFloat(quantity.replace(',', '.'));
        onConfirm(item, inputQty, observation);
    };

    if (!item) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContainer}>
                        
                        {/* CABEÇALHO COM INFORMAÇÕES DO PRODUTO */}
                        <View style={styles.header}>
                            <View style={styles.headerTop}>
                                <Text style={styles.title}>Conferência de Item</Text>
                                <TouchableWithoutFeedback onPress={onClose}>
                                    <Ionicons name="close" size={24} color={colors.textLight} />
                                </TouchableWithoutFeedback>
                            </View>
                            <Text style={styles.productName}>{item.descricao}</Text>
                            <Text style={styles.productCode}>{item.codigo_produto} - {item.referencia || 'S/ REF'}</Text>
                        </View>

                        <View style={styles.content}>
                            
                            {/* PASSO 1: DIGITAR QUANTIDADE */}
                            {step === 'quantity' && (
                                <>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>Quantidade Esperada:</Text>
                                        <Text style={styles.infoValue}>{item.quantidade} {item.unidade}</Text>
                                    </View>

                                    <Text style={styles.label}>Qtd. Conferida:</Text>
                                    <TextInput
                                        ref={quantityInputRef}
                                        style={styles.inputQuantity}
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.textLight}
                                        selectTextOnFocus
                                    />

                                    <AnimatedButton style={styles.confirmButton} onPress={handleQuantityConfirm}>
                                        <Text style={styles.confirmButtonText}>CONFIRMAR QUANTIDADE</Text>
                                    </AnimatedButton>
                                </>
                            )}

                            {/* PASSO 2: JUSTIFICAR DIVERGÊNCIA */}
                            {step === 'observation' && (
                                <>
                                    <View style={styles.warningBox}>
                                        <Ionicons name="warning" size={24} color="#F57C00" />
                                        <Text style={styles.warningText}>
                                            Divergência detectada!
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.diffRow}>
                                        <Text style={styles.diffText}>Esperado: <Text style={{fontWeight:'bold'}}>{item.quantidade}</Text></Text>
                                        <Ionicons name="arrow-forward" size={16} color={colors.text} />
                                        <Text style={[styles.diffText, {color: colors.danger}]}>Digitado: <Text style={{fontWeight:'bold'}}>{quantity}</Text></Text>
                                    </View>

                                    <Text style={styles.label}>Motivo da Divergência:</Text>
                                    <TextInput
                                        ref={obsInputRef}
                                        style={styles.inputObs}
                                        value={observation}
                                        onChangeText={setObservation}
                                        placeholder="Ex: Caixa amassada, falta item..."
                                        placeholderTextColor={colors.textLight}
                                        multiline
                                    />

                                    <AnimatedButton style={styles.confirmButton} onPress={handleFinalConfirm}>
                                        <Text style={styles.confirmButtonText}>SALVAR DIVERGÊNCIA</Text>
                                    </AnimatedButton>
                                    
                                    <AnimatedButton 
                                        style={styles.backButton} 
                                        onPress={() => {
                                            setStep('quantity');
                                            setTimeout(() => quantityInputRef.current?.focus(), 100);
                                        }}
                                    >
                                        <Text style={styles.backButtonText}>Corrigir Quantidade</Text>
                                    </AnimatedButton>
                                </>
                            )}

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.cardBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        elevation: 10,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 15,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    productName: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 4,
    },
    productCode: {
        fontSize: 14,
        color: colors.textLight,
    },
    content: {
        gap: 15,
    },
    infoBox: {
        backgroundColor: colors.inputBackground,
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 16,
        color: colors.text,
    },
    infoValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    label: {
        fontSize: 16,
        color: colors.text,
        fontWeight: 'bold',
    },
    inputQuantity: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 10,
        padding: 15,
        fontSize: 32, // Fonte grande para números
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.black,
    },
    inputObs: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: colors.black,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0', // Laranja bem claro
        padding: 10,
        borderRadius: 8,
        gap: 10,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    warningText: {
        color: '#E65100', // Laranja escuro
        fontWeight: 'bold',
        fontSize: 16,
    },
    diffRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 10,
    },
    diffText: {
        fontSize: 16,
        color: colors.text,
    },
    confirmButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    confirmButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        padding: 15,
        alignItems: 'center',
    },
    backButtonText: {
        color: colors.textLight,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default ItemConferenceModal;