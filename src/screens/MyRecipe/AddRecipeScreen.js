import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const API_BASE_URL = 'http://43.200.200.161:8080';

// --- ## 기능 추가를 위한 데이터 ## ---
const ALL_TOOLS = {
    '프라이팬': 1, '냄비': 2, '웍': 4, '밀대': 8, '믹서기': 16, '핸드블랜더': 32, '거품기': 64,
    '연육기': 128, '착즙기': 256, '전자레인지': 512, '가스레인지': 1024, '오븐': 2048,
    '에어프라이어': 4096, '주전자': 8192, '압력솥': 16384, '토스터': 32768, '찜기': 65536
};
const ALL_TYPES = { '식사': 1, '디저트': 2, '간식': 3, '기타': 0 };

const AddRecipeScreen = ({ navigation }) => {
  const [recipeName, setRecipeName] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipeSteps, setRecipeSteps] = useState([]);
  const [newIngredientText, setNewIngredientText] = useState('');
  const [newRecipeStep, setNewRecipeStep] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // --- ## 기능 추가를 위한 상태 ## ---
  const [tools, setTools] = useState(0);
  const [type, setType] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', data: {}, isMultiSelect: false, onConfirm: () => {} });

  const scrollViewRef = useRef(null);

  const addIngredient = () => {
    if (newIngredientText.trim()) {
      const parts = newIngredientText.trim().split(' ');
      const name = parts[0];
      const count = parts.slice(1).join(' ');
      
      setIngredients([...ingredients, { name, count }]);
      setNewIngredientText('');
    }
  };
  const addStep = () => {
    if (newRecipeStep.trim()) {
      setRecipeSteps([...recipeSteps, newRecipeStep.trim()]);
      setNewRecipeStep('');
    }
  };
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
  const removeStep = (index) => setRecipeSteps(recipeSteps.filter((_, i) => i !== index));

  const saveRecipe = async () => {
    if (!recipeName.trim() || ingredients.length === 0 || recipeSteps.length === 0) {
        Alert.alert('알림', '음식 이름, 재료, 레시피를 모두 1개 이상 입력해주세요.');
        return;
    }
    
    setIsSaving(true);
    try {
      const token = await getAuthToken();
      const newRecipeData = {
        name: recipeName,
        time: cookingTime,
        mainIngredients: ingredients.length > 0 ? [ingredients[0]] : [],
        subIngredients: ingredients.length > 1 ? ingredients.slice(1) : [],
        recipe: recipeSteps,
        tools: tools, // 선택된 도구 값
        type: type,   // 선택된 종류 값
      };

      await axios.post(`${API_BASE_URL}/api/recipes/added`, newRecipeData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('성공', '레시피가 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('레시피 저장 오류:', error.response?.data || error.message);
      Alert.alert('오류', '레시피 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- ## 모달 로직 ## ---
  const openToolSelector = () => {
    setModalData({
        title: '조리도구 선택',
        data: ALL_TOOLS,
        isMultiSelect: true,
        onConfirm: (selectedBits) => setTools(selectedBits)
    });
    setModalVisible(true);
  };
  const openTypeSelector = () => {
    setModalData({
        title: '음식 종류 선택',
        data: ALL_TYPES,
        isMultiSelect: false,
        onConfirm: (selectedValue) => setType(selectedValue)
    });
    setModalVisible(true);
  };
  const getSelectedNames = (bitmask, source) => {
    if (!bitmask) return '선택 안 함';
    return Object.keys(source).filter(name => (bitmask & source[name]) !== 0).join(', ') || '선택 안 함';
  };
  const getTypeName = (value, source) => {
    return Object.keys(source).find(name => source[name] === value) || '기타';
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>레시피 추가</Text>
        <View style={{width: 32}}/>
      </View>
      
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.formContainer}>
        {/* --- ## UI 및 기능 수정 ## --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>음식 이름</Text>
          <TextInput style={styles.textInput} value={recipeName} onChangeText={setRecipeName} placeholder="예: 김치볶음밥" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예상 조리 시간</Text>
          <TextInput style={styles.textInput} value={cookingTime} onChangeText={setCookingTime} placeholder="예: 30분" />
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>조리도구</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={openToolSelector}>
                <Text style={styles.selectorText} numberOfLines={1}>{getSelectedNames(tools, ALL_TOOLS)}</Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>음식 종류</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={openTypeSelector}>
                <Text style={styles.selectorText}>{getTypeName(type, ALL_TYPES)}</Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료</Text>
          {ingredients.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.name} {item.count}</Text>
              <TouchableOpacity onPress={() => removeIngredient(index)}>
                <Ionicons name="remove-circle-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addItemContainer}>
            <TextInput style={styles.addInput} value={newIngredientText} onChangeText={setNewIngredientText} placeholder="예: 당근 100g" onSubmitEditing={addIngredient}/>
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>조리 과정</Text>
          {recipeSteps.map((step, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.itemText}>{step}</Text>
              <TouchableOpacity onPress={() => removeStep(index)}>
                <Ionicons name="remove-circle-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addItemContainer}>
            <TextInput style={styles.addInput} value={newRecipeStep} onChangeText={setNewRecipeStep} placeholder={`${recipeSteps.length + 1}단계 과정 입력`} onSubmitEditing={addStep} multiline />
            <TouchableOpacity style={styles.addButton} onPress={addStep}>
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveRecipe} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>저장하기</Text>}
        </TouchableOpacity>
      </View>

      <SelectionModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        {...modalData} 
        currentSelection={modalData.isMultiSelect ? tools : type}
      />
    </SafeAreaView>
  );
};

// --- ## 모달 컴포넌트 ## ---
const SelectionModal = ({ isVisible, onClose, title, data, isMultiSelect, onConfirm, currentSelection }) => {
    const [selection, setSelection] = useState(currentSelection);
    
    const handleSelect = (value) => {
        if (isMultiSelect) {
            setSelection(prev => (prev & value) ? prev - value : prev | value);
        } else {
            setSelection(value);
        }
    };
    const confirm = () => {
        onConfirm(selection);
        onClose();
    };

    return (
        <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <FlatList
                        data={Object.keys(data)}
                        keyExtractor={item => item}
                        renderItem={({ item }) => {
                            const value = data[item];
                            const isSelected = isMultiSelect ? (selection & value) !== 0 : selection === value;
                            return (
                                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelect(value)}>
                                    <Text style={{flex: 1, fontSize: 16}}>{item}</Text>
                                    <Ionicons name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={isSelected ? '#fbbf24' : '#ccc'} />
                                </TouchableOpacity>
                            )
                        }}
                    />
                    <TouchableOpacity style={styles.modalConfirmButton} onPress={confirm}>
                        <Text style={styles.saveButtonText}>확인</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    )
};


// --- ## UI 통일을 위해 스타일시트 업데이트 ## ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: hp(7), paddingBottom: hp(2), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerButton: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 999 },
    headerTitle: { fontSize: hp(2.2), fontWeight: 'bold' },
    formContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' },
    textInput: { borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 12, paddingHorizontal: 12, fontSize: 16, borderRadius: 8, backgroundColor: '#f9fafb' },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, borderRadius: 8, backgroundColor: '#f9fafb' },
    itemText: { fontSize: 16, color: '#374151', flex: 1, lineHeight: 22 },
    stepNumber: { fontSize: 16, color: '#fbbf24', fontWeight: 'bold', marginRight: 8 },
    addItemContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    addInput: { flex: 1, height: 50, backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 16, fontSize: 16 },
    addButton: { padding: 12, backgroundColor: '#4b5563', borderRadius: 8, marginLeft: 8 },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    saveButton: { backgroundColor: '#fbbf24', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    selectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f9fafb' },
    selectorText: { fontSize: 16, color: '#374151', flex: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '85%', maxHeight: '70%', backgroundColor: 'white', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    modalConfirmButton: { backgroundColor: '#fbbf24', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 }
});

export default AddRecipeScreen;