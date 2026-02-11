// components/modals/ItemConferenceModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedButton from '../common/AnimatedButton';
import { Ionicons } from '@expo/vector-icons';

const ItemConferenceModal = ({ visible, item, onClose, onConfirm }) => {
    const { colors } = useTheme();
    // Passamos uma cor de erro fixa para garantir o visual vermelho
    const styles = getStyles(colors, '#D32F2F'); 
    
    // Estados
    const [step, setStep] = useState('quantity'); // 'quantity' ou 'observation'
    const [quantity, setQuantity] = useState('');
    const [observation, setObservation] = useState('');
    
    // NOVO ESTADO: Para controlar a mensagem de erro visual
    const [errorMsg, setErrorMsg] = useState(null);

    const quantityInputRef = useRef(null);
    const obsInputRef = useRef(null);

    // Resetar estados quando o modal abre ou o item muda
    useEffect(() => {
        if (visible && item) {
            setStep('quantity');
            setQuantity(''); 
            setObservation('');
            setErrorMsg(null); // Reseta o erro ao abrir
            
            setTimeout(() => {
                quantityInputRef.current?.focus();
            }, 100);
        }
    }, [visible, item]);

    // Função auxiliar para limpar erro ao digitar
    const handleQuantityChange = (text) => {
        setQuantity(text);
        if (errorMsg) setErrorMsg(null); // Limpa o erro se o usuário começar a corrigir
    };

    const handleQuantityConfirm = () => {
        // Limpa erro anterior antes de validar
        setErrorMsg(null);

        let inputQtyStr = quantity.replace(',', '.');
        // Se estiver vazio, considera 0
        if (inputQtyStr.trim() === '') inputQtyStr = '0';

        const inputQty = parseFloat(inputQtyStr);
        const expectedQty = parseFloat(item?.quantidade || 0);

        if (isNaN(inputQty)) {
             // Define a mensagem de erro visual em vez de Alert
            setErrorMsg("Por favor, digite um número válido.");
            return;
        }

        // REGRA DE OURO: Bloquear quantidade maior que o esperado
        if (inputQty > expectedQty) {
            // Define a mensagem de erro visual no estilo "balão"
            setErrorMsg(`A quantidade não pode ser maior que a esperada (${expectedQty}).`);
            return; // Para aqui e mostra o erro visual
        }

        // Verifica divergência (apenas para menos)
        if (inputQty < expectedQty && inputQty >= 0) {
            setStep('observation');
            setTimeout(() => {
                obsInputRef.current?.focus();
            }, 100);
        } else if (inputQty === expectedQty) {
            onConfirm(item, inputQty, null);
        } else {
             setErrorMsg("Quantidade inválida.");
        }
    };

    const handleFinalConfirm = () => {
        if (!observation || observation.trim() === '') {
            // Aqui ainda usamos Alert pois é um passo diferente, 
            // mas poderíamos aplicar a mesma lógica se quisesse.
            Alert.alert("Atenção", "Por favor, informe o motivo da divergência.");
            return;
        }
        const inputQty = parseFloat(quantity.replace(',', '.') || '0');
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
                                    
                                    {/* INPUT COM ESTILO DINÂMICO */}
                                    <TextInput
                                        ref={quantityInputRef}
                                        // Aplica estilo de erro se errorMsg existir
                                        style={[
                                            styles.inputQuantity, 
                                            errorMsg && styles.inputError
                                        ]}
                                        value={quantity}
                                        onChangeText={handleQuantityChange} // Usa a nova função
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={colors.textLight}
                                        selectTextOnFocus
                                    />

                                    {/* BALÃO DE ERRO ESTÉTICO */}
                                    {errorMsg && (
                                        <View style={styles.errorBubbleContainer}>
                                            {/* O triângulo apontando para cima */}
                                            <View style={styles.errorTriangle} />
                                            {/* O corpo do balão */}
                                            <View style={styles.errorBubbleBody}>
                                                <Ionicons name="alert-circle" size={20} color="#D32F2F" />
                                                <Text style={styles.errorText}>{errorMsg}</Text>
                                            </View>
                                        </View>
                                    )}

                                    <AnimatedButton style={styles.confirmButton} onPress={handleQuantityConfirm}>
                                        <Text style={styles.confirmButtonText}>CONFIRMAR QUANTIDADE</Text>
                                    </AnimatedButton>
                                </>
                            )}

                            {/* PASSO 2: JUSTIFICAR DIVERGÊNCIA (Sem alterações visuais aqui) */}
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
                                            setErrorMsg(null); // Limpa erro ao voltar
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

// Recebe a cor de erro como parâmetro
const getStyles = (colors, errorColor) => StyleSheet.create({
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
        paddingBottom: 30, // Um pouco mais de espaço embaixo
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
        marginBottom: 5,
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
        marginBottom: 5,
    },
    // Estilo base do input
    inputQuantity: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.primary, // Cor padrão (azul/verde do tema)
        borderRadius: 12, // Bordas mais arredondadas
        padding: 15,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.black,
    },
    // Estilo condicional de erro para o input
    inputError: {
        borderColor: errorColor, // Borda vermelha
        backgroundColor: '#FFEBEE', // Fundo levemente avermelhado
        color: errorColor, // Texto vermelho
    },
    
    // --- Estilos do Balão de Erro ---
    errorBubbleContainer: {
        alignItems: 'center',
        marginTop: -5, // Puxa um pouco para cima para conectar com o input
        marginBottom: 5,
    },
    errorTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: errorColor, // Cor do triângulo igual à borda
        marginBottom: -2, // Sobrepõe levemente o corpo do balão
    },
    errorBubbleBody: {
        backgroundColor: '#FFEBEE', // Fundo vermelho claro
        borderColor: errorColor,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%', // Ocupa a largura disponível
    },
    errorText: {
        color: errorColor,
        fontSize: 14,
        fontWeight: '600',
        flex: 1, // Permite que o texto quebre linha se necessário
    },
    // ------------------------------------

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
        backgroundColor: '#FFF3E0',
        padding: 10,
        borderRadius: 8,
        gap: 10,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    warningText: {
        color: '#E65100',
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