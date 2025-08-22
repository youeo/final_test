import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Modal, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const API_BASE_URL = 'http://43.200.200.161:8080';

const MyRecipe = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('saved');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('latest');

  useFocusEffect(
    React.useCallback(() => {
      loadRecipesFromServer();
    }, [activeTab, sortOption])
  );

  const loadRecipesFromServer = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Welcome');
        return;
      }
      
      const endpoint = activeTab === 'saved' ? '/api/recipes/like' : '/api/recipes/added';
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let loadedRecipes = response.data || [];
      
      if (sortOption === 'alphabetical') {
        loadedRecipes.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      }
      
      setRecipes(loadedRecipes);

    } catch (error) {
      console.error('레시피 로드 오류:', error);
      Alert.alert('오류', '레시피를 불러오는 중 문제가 발생했습니다.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // --- ## '작성한 레시피' 삭제 함수 ## ---
  const deleteRecipe = (recipeToDelete) => {
    Alert.alert(
      '레시피 삭제',
      `"${recipeToDelete.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              await axios.delete(`${API_BASE_URL}/api/recipes/added?recipeCode=${recipeToDelete.code}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.code !== recipeToDelete.code));
              Alert.alert('완료', '레시피가 삭제되었습니다.');

            } catch (error) {
              console.error('레시피 삭제 오류:', error);
              Alert.alert('오류', '레시피 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };
  
  // --- ## '찜한 레시피' 제거 함수 (새로 추가) ## ---
  const removeLikedRecipe = (recipeToRemove) => {
    Alert.alert(
      '찜 취소',
      `"${recipeToRemove.name}" 찜을 취소하시겠습니까?`,
      [
        { text: '아니요', style: 'cancel' },
        {
          text: '네',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              await axios.delete(`${API_BASE_URL}/api/recipes/like`, {
                params: { recipeCode: recipeToRemove.code },
                headers: { Authorization: `Bearer ${token}` }
              });
              
              setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.code !== recipeToRemove.code));
              Alert.alert('완료', '찜이 취소되었습니다.');

            } catch (error) {
              console.error('찜 취소 오류:', error);
              Alert.alert('오류', '찜 취소 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };
  
  const changeSortOption = (option) => {
    setSortOption(option);
    setSortModalVisible(false);
  };

  const RecipeCard = ({ recipe }) => {
    
    const sub = Array.isArray(recipe.subIngredients) ? recipe.subIngredients : [];
    const ingredientsList = sub
      .map(ing => ing?.name) 
      .filter(Boolean)      
      .join(', ');         
    
    
    return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => navigation.navigate('MyRecipeDetailScreen', { 
            recipe: recipe,
            isEditable: activeTab === 'added' 
        })}
      >
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={activeTab === 'saved' 
            ? () => removeLikedRecipe(recipe) 
            : () => deleteRecipe(recipe)
          }
        >
          <Ionicons 
            name={"heart-dislike-outline"}
            size={24} 
            color={activeTab === 'saved' ? "#ef4444" : "#ef4444"} 
          />
        </TouchableOpacity>
        
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
            {recipe.time ? (
              <Text style={styles.cookingTime}>조리시간: {recipe.time}</Text>
            ) : null}
            <Text style={styles.ingredients} numberOfLines={1} ellipsizeMode="tail">
              주요재료: {ingredientsList || '정보 없음'}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color="#d4d4d8" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyRecipeList = ({ message }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={50} color="#d4d4d8" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>나의 레시피</Text>
        <View style={{width: 32}}/>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' ? styles.activeTabText : styles.inactiveTabText]}>
            찜한 레시피
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'added' && styles.activeTab]}
          onPress={() => setActiveTab('added')}
        >
          <Text style={[styles.tabText, activeTab === 'added' ? styles.activeTabText : styles.inactiveTabText]}>
            작성한 레시피
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlContainer}>
        <TouchableOpacity 
          style={styles.sortContainer}
          onPress={() => setSortModalVisible(true)}
        >
          <Text style={styles.sortText}>
            {sortOption === 'latest' ? '최신순' : '가나다순'}
          </Text>
          <Ionicons name="swap-vertical" size={16} color="#6b7280" />
        </TouchableOpacity>

        {activeTab === 'added' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddRecipeScreen')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>레시피 추가</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>정렬 기준</Text>
            <TouchableOpacity 
              style={styles.sortOption}
              onPress={() => changeSortOption('latest')}
            >
              <Text style={styles.sortOptionText}>최신 등록순</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sortOption}
              onPress={() => changeSortOption('alphabetical')}
            >
              <Text style={styles.sortOptionText}>가나다순</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard key={`${recipe.code}-${recipe.name}`} recipe={recipe} />
            ))
          ) : (
            <EmptyRecipeList 
              message={activeTab === 'saved' ? "찜한 레시피가 없습니다." : "작성한 레시피가 없습니다."} 
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: hp(7), paddingBottom: hp(2), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerButton: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 999 },
    headerTitle: { fontSize: hp(2.2), fontWeight: 'bold' },
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    tabButton: { flex: 1, alignItems: 'center', paddingVertical: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#fbbf24' },
    tabText: { fontSize: 16 },
    activeTabText: { color: '#fbbf24', fontWeight: 'bold' },
    inactiveTabText: { color: '#6b7280' },
    controlContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginVertical: 16 },
    sortContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
    sortText: { fontSize: 14, color: '#6b7280', marginRight: 4 },
    addButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#4b5563', borderRadius: 20 },
    addButtonText: { fontSize: 14, fontWeight: '600', marginLeft: 4, color: '#fff' },
    scrollView: { flex: 1, paddingHorizontal: 16 },
    recipeCard: { backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#1f2937', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    deleteButton: { position: 'absolute', top: 8, right: 8, zIndex: 1, padding: 4 },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    textContainer: { flex: 1 },
    recipeName: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    cookingTime: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
    ingredients: { fontSize: 13, color: '#9ca3af' },
    arrowContainer: { paddingLeft: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#9ca3af', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    sortOption: { paddingVertical: 16, alignItems: 'center' },
    sortOptionText: { fontSize: 16 },
});

export default MyRecipe;