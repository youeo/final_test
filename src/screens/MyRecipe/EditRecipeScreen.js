import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';

const API_BASE_URL = 'http://43.200.200.161:8080';

const EditRecipeScreen = ({ navigation, route }) => {
  const { recipe } = route.params;
  
  const [recipeName, setRecipeName] = useState(recipe.name);
  const [cookingTime, setCookingTime] = useState(recipe.time); // 'time' 필드 사용
  const [ingredients, setIngredients] = useState([
      ...(recipe.mainIngredients || []), 
      ...(recipe.subIngredients || [])
  ]);
  const [recipeSteps, setRecipeSteps] = useState(recipe.recipe || []); // 'recipe' 필드 사용
  const [newIngredientText, setNewIngredientText] = useState('');
  const [newRecipeStep, setNewRecipeStep] = useState('');
  
  const scrollViewRef = useRef(null);

  const addIngredientFromInput = () => {
    if (newIngredientText.trim()) {
      const parts = newIngredientText.trim().split(' ');
      const name = parts[0];
      const amount = parts.slice(1).join(' ') || '';
      
      const newIngredient = { name: name, count: amount };
      setIngredients([...ingredients, newIngredient]);
      setNewIngredientText('');
      
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const addRecipeStepFromInput = () => {
    if (newRecipeStep.trim()) {
      setRecipeSteps([...recipeSteps, newRecipeStep.trim()]);
      setNewRecipeStep('');
      
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const removeRecipeStep = (index) => {
    setRecipeSteps(recipeSteps.filter((_, i) => i !== index));
  };

  // ## saveRecipe 함수를 서버 API 호출로 변경 ##
  const saveRecipe = async () => {
    if (!recipeName.trim()) {
      Alert.alert('알림', '음식 이름을 입력해주세요.');
      return;
    }
    
    try {
      const token = await getAuthToken();
      
      const updatedRecipeData = {
        ...recipe, // 기존 recipe의 code(rid), tools 등 정보를 유지
        name: recipeName,
        time: cookingTime,
        mainIngredients: ingredients.length > 0 ? [ingredients[0]] : [],
        subIngredients: ingredients.length > 1 ? ingredients.slice(1) : [],
        recipe: recipeSteps,
      };
      
      await axios.put(`${API_BASE_URL}/recipes/added`, updatedRecipeData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('성공', '레시피가 수정되었습니다.', [
        // 상세 화면과 목록 화면을 모두 거쳐 홈으로 돌아가도록 pop(2) 사용
        { text: '확인', onPress: () => navigation.pop(2) }
      ]);
    } catch (error) {
      console.error('레시피 수정 오류:', error);
      Alert.alert('오류', '레시피 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>레시피 수정</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Recipe Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>음식 이름</Text>
            <TextInput style={styles.textInput} value={recipeName} onChangeText={setRecipeName} placeholder="예: 김치볶음밥" placeholderTextColor="#ccc" />
          </View>

          {/* Cooking Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>조리예정 시간</Text>
            <TextInput style={styles.textInput} value={cookingTime} onChangeText={setCookingTime} placeholder="예: 30분" placeholderTextColor="#ccc" />
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>재료</Text>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeIngredient(index)}>
                  <Text style={styles.removeButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.ingredientText}>{ingredient.name} {ingredient.count}</Text>
              </View>
            ))}
            <View style={styles.addIngredientContainer}>
              <Text style={styles.addButtonText}>+</Text>
              <TextInput style={styles.addIngredientInput} value={newIngredientText} onChangeText={setNewIngredientText} placeholder="예: 당근 100g" placeholderTextColor="#999" onSubmitEditing={addIngredientFromInput} returnKeyType="done" />
            </View>
          </View>

          {/* Recipe Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>레시피</Text>
            {recipeSteps.map((step, index) => (
              <View key={index} style={styles.recipeStepRow}>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeRecipeStep(index)}>
                  <Text style={styles.removeButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.recipeStepText}>{index + 1}. {step}</Text>
              </View>
            ))}
            <View style={styles.addRecipeContainer}>
              <Text style={styles.addButtonText}>+</Text>
              <TextInput style={styles.addRecipeInput} value={newRecipeStep} onChangeText={setNewRecipeStep} placeholder={`${recipeSteps.length + 1}. 조리 과정을 입력하세요`} placeholderTextColor="#999" onSubmitEditing={addRecipeStepFromInput} returnKeyType="done" />
            </View>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveRecipe}>
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#666' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 50 },
    backButton: { padding: 8 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 12 },
    formContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 24, paddingBottom: 20, flex: 1 },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#333' },
    textInput: { borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 12, fontSize: 16, color: '#333' },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    recipeStepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    removeButton: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    removeButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    ingredientText: { fontSize: 16, color: '#333', flex: 1 },
    recipeStepText: { fontSize: 16, color: '#333', flex: 1 },
    addIngredientContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    addRecipeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    addButtonText: { fontSize: 20, color: '#333', fontWeight: 'bold', marginRight: 12 },
    addIngredientInput: { flex: 1, height: 40, backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#333' },
    addRecipeInput: { flex: 1, height: 40, backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#333' },
    saveButton: { backgroundColor: '#666', marginHorizontal: 20, marginTop: 20, paddingVertical: 16, borderRadius: 25, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default EditRecipeScreen;