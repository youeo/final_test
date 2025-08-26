import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';

const API_BASE_URL = 'http://43.200.200.161:8080';

const ALL_TOOLS = {
    '프라이팬': 1, '냄비': 2, '웍': 4, '밀대': 8, '믹서기': 16, '핸드블랜더': 32, '거품기': 64,
    '연육기': 128, '착즙기': 256, '전자레인지': 512, '가스레인지': 1024, '오븐': 2048,
    '에어프라이어': 4096, '주전자': 8192, '압력솥': 16384, '토스터': 32768, '찜기': 65536
};
const ALL_TYPES = { '식사': 1, '디저트': 2, '간식': 3, '기타': 0 };

const SelectionModal = ({ isVisible, onClose, title, data, isMultiSelect, onConfirm, currentSelection }) => {
    const [selection, setSelection] = useState(currentSelection);
    useEffect(() => { setSelection(currentSelection); }, [isVisible, currentSelection]);

    const handleSelect = (value) => setSelection(prev => isMultiSelect ? ((prev & value) ? prev - value : prev | value) : value);
    const confirm = () => { onConfirm(selection); onClose(); };

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
                                    <Text style={styles.modalItemText}>{item}</Text>
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

const RecipeFormScreen = ({ navigation, route }) => {
  const existingRecipe = route.params?.recipe;
  const isEditMode = !!existingRecipe;

  const [recipeName, setRecipeName] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipeSteps, setRecipeSteps] = useState([]);
  const [tools, setTools] = useState(0);
  const [type, setType] = useState(0);

  const [newIngredientText, setNewIngredientText] = useState('');
  const [newRecipeStep, setNewRecipeStep] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', data: {}, isMultiSelect: false, onConfirm: () => {} });


  useEffect(() => {
    if (isEditMode) {
      setRecipeName(existingRecipe.name || '');
      setCookingTime(existingRecipe.time || '');
      setTools(existingRecipe.tools || 0);
      setType(existingRecipe.type || 0);

      const allIngredients = [
        ...(existingRecipe.mainIngredients || []),
        ...(existingRecipe.subIngredients || [])
      ];
      const validIngredients = allIngredients.filter(ing => ing && ing.name && ing.name.trim() !== '');
      setIngredients(validIngredients);
      
  
      const stepsFromServer = existingRecipe.recipe || [];
      const validSteps = stepsFromServer.map(String).filter(step => step.trim() !== '');
      setRecipeSteps(validSteps);
    }
  }, [isEditMode, existingRecipe]);
  

  const addIngredient = () => {
    const trimmedName = newIngredientText.trim();
    if (trimmedName) {
      setIngredients([...ingredients, { name: trimmedName, count: '' }]);
      setNewIngredientText('');
    }
  };

  const addStep = () => {
    if (newRecipeStep.trim()) {
      setRecipeSteps([...recipeSteps, newRecipeStep.trim()]);
      setNewRecipeStep('');
    }
  };

  const saveRecipe = async () => {
    if (!recipeName.trim() || ingredients.length === 0 || recipeSteps.length === 0) {
        Alert.alert('알림', '음식 이름, 재료, 레시피를 모두 입력해주세요.');
        return;
    }
    
    setIsSaving(true);
    try {
      const token = await getAuthToken();
      const recipeData = {
        name: recipeName,
        time: cookingTime,
        mainIngredients: ingredients.slice(0, 1),
        subIngredients: ingredients.slice(1),
        recipe: recipeSteps,
        tools,
        type,
      };

      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/recipes/added`, { ...existingRecipe, ...recipeData }, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });
        Alert.alert('성공', '레시피가 수정되었습니다.', [
          { text: '확인', onPress: () => navigation.pop(2) }
        ]);
      } else {
        await axios.post(`${API_BASE_URL}/api/recipes/added`, recipeData, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });
        Alert.alert('성공', '레시피가 저장되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('레시피 저장/수정 오류:', error.response?.data || error.message);
      Alert.alert('오류', `레시피 ${isEditMode ? '수정' : '저장'} 중 오류가 발생했습니다.`);
    } finally {
        setIsSaving(false);
    }
  };

  const openModal = (title, data, isMultiSelect, onConfirm) => {
    setModalData({ title, data, isMultiSelect, onConfirm });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? '레시피 수정' : '레시피 추가'}</Text>
        <View style={{width: 32}}/>
      </View>
      
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>음식 이름</Text>
          <TextInput style={styles.textInput} value={recipeName} onChangeText={setRecipeName} placeholder="예: 김치볶음밥" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>조리 시간</Text>
          <TextInput style={styles.textInput} value={cookingTime} onChangeText={setCookingTime} placeholder="예: 30분" />
        </View>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>조리도구</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={() => openModal('조리도구 선택', ALL_TOOLS, true, setTools)}>
                <Text style={styles.selectorText} numberOfLines={1}>{Object.keys(ALL_TOOLS).filter(k => (tools & ALL_TOOLS[k])).join(', ') || '선택 안 함'}</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>음식 종류</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={() => openModal('음식 종류 선택', ALL_TYPES, false, setType)}>
                <Text style={styles.selectorText}>{Object.keys(ALL_TYPES).find(k => ALL_TYPES[k] === type) || '기타'}</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료</Text>
          <Text style={styles.sectionSubtitle}>첫 항목이 주재료, 나머지는 부재료로 등록됩니다.</Text>
          {ingredients.map((item, i) => (
            <View key={i} style={styles.itemRow}>
                <Text style={styles.itemText}>{item.name}</Text>
              <TouchableOpacity onPress={() => setIngredients(prev => prev.filter((_, idx) => idx !== i))}>
                <Ionicons name="remove-circle-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addItemContainer}>
            <TextInput style={styles.addInput} value={newIngredientText} onChangeText={setNewIngredientText} placeholder="예: 당근" onSubmitEditing={addIngredient}/>
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}><Ionicons name="add" size={24} color="#fff" /></TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>조리 과정</Text>
          {recipeSteps.map((step, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.stepNumber}>{i + 1}.</Text>
              <Text style={styles.itemText}>{step}</Text>
              <TouchableOpacity onPress={() => setRecipeSteps(prev => prev.filter((_, idx) => idx !== i))}>
                <Ionicons name="remove-circle-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addItemContainer}>
            <TextInput 
              style={styles.addInput} 
              value={newRecipeStep} 
              onChangeText={setNewRecipeStep} 
              placeholder={`${recipeSteps.length + 1}. 과정 입력`} 
              onSubmitEditing={addStep} 
              multiline 
            />
            <TouchableOpacity style={styles.addButton} onPress={addStep}><Ionicons name="add" size={24} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveRecipe} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{isEditMode ? '수정 완료' : '저장하기'}</Text>}
        </TouchableOpacity>
      </View>

      <SelectionModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} {...modalData} currentSelection={modalData.isMultiSelect ? tools : type} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: hp(7), paddingBottom: hp(2), borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerButton: { padding: 8 },
    headerTitle: { fontSize: hp(2.2), fontWeight: 'bold' },
    formContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' },
    sectionSubtitle: { fontSize: 14, color: '#6b7280', marginTop: -8, marginBottom: 12 },
    textInput: { borderWidth: 1, borderColor: '#d1d5db', padding: 12, fontSize: 16, borderRadius: 8, backgroundColor: '#f9fafb' },
    selectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 8, backgroundColor: '#f9fafb' },
    selectorText: { fontSize: 16, color: '#374151', flex: 1 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 12, borderRadius: 8, backgroundColor: '#f9fafb' },
    itemText: { fontSize: 16, color: '#374151', flex: 1, lineHeight: 22 },
    stepNumber: { fontSize: 16, color: '#fbbf24', fontWeight: 'bold', marginRight: 8 },
    addItemContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    addInput: { flex: 1, minHeight: 50, backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, paddingTop: 16, paddingBottom: 16 },
    addButton: { padding: 12, backgroundColor: '#fbbf24', borderRadius: 8, marginLeft: 8, alignSelf: 'stretch', justifyContent: 'center' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    saveButton: { backgroundColor: '#fbbf24', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '85%', maxHeight: '70%', backgroundColor: 'white', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
    modalItemText: {flex: 1, fontSize: 16},
    modalConfirmButton: { backgroundColor: '#fbbf24', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 }
});

export default RecipeFormScreen;