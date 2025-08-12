import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';

const API_BASE_URL = 'http://43.200.200.161:8080';

const MyRecipe = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'added'
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('latest'); // 'latest' or 'alphabetical'

  useFocusEffect(
    React.useCallback(() => {
      loadRecipesFromServer();
    }, [activeTab, sortOption]) // 탭이나 정렬 옵션이 바뀔 때마다 데이터 다시 로드
  );

  // ## AsyncStorage 대신 서버에서 레시피 로드 ##
  const loadRecipesFromServer = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Welcome');
        return;
      }
      
      const endpoint = activeTab === 'saved' ? '/recipes/like' : '/recipes/added';
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let loadedRecipes = response.data || [];
      
      // 클라이언트 사이드 정렬
      if (sortOption === 'latest') {
        // 서버에서 이미 최신순으로 준다고 가정. 만약 아니라면 createdAt 같은 필드 기준으로 정렬.
        // 예: loadedRecipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortOption === 'alphabetical') {
        loadedRecipes.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      }
      
      setRecipes(loadedRecipes);

    } catch (error) {
      console.error('레시피 로드 오류:', error);
      Alert.alert('오류', '레시피를 불러오는 중 문제가 발생했습니다.');
      setRecipes([]); // 오류 발생 시 목록 비우기
    } finally {
      setLoading(false);
    }
  };

  // ## 레시피 삭제 함수를 서버 API 호출로 변경 ##
  const deleteRecipe = async (recipeToDelete) => {
    Alert.alert(
      '레시피 삭제',
      `"${recipeToDelete.name}"을(를) 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              // 서버 레시피 ID는 'code' 필드에 담겨있음
              await axios.delete(`${API_BASE_URL}/recipes/added?recipeCode=${recipeToDelete.code}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('완료', '레시피가 삭제되었습니다.');
              loadRecipesFromServer(); // 삭제 후 목록 새로고침
            } catch (error) {
              console.error('레시피 삭제 오류:', error);
              Alert.alert('오류', '레시피 삭제 중 오류가 발생했습니다.');
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
    const main = Array.isArray(recipe.mainIngredients) ? recipe.mainIngredients : [];
    const sub = Array.isArray(recipe.subIngredients) ? recipe.subIngredients : [];
    const ingredientsList = [...main, ...sub]
      .map(ing => ing?.name)
      .filter(Boolean) 
      .join(', '); 

    return (
      <View style={styles.recipeCard}>
        {activeTab === 'added' && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteRecipe(recipe)}
          >
            <Ionicons name="close" size={12} color="#fff" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.cardTouchable}
          onPress={() => navigation.navigate('MyRecipeDetailScreen', { recipe: recipe })}
        >
          <View style={styles.cardContent}>
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={24} color="#999" />
              </View>
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              {recipe.time ? (
                <Text style={styles.cookingTime}>조리시간: {recipe.time}</Text>
              ) : null}
              <Text style={styles.ingredients} numberOfLines={1} ellipsizeMode="tail">
                재료: {ingredientsList}
              </Text>
            </View>
            
            <View style={styles.arrowContainer}>
              <Text style={styles.arrowText}>≫</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };



  const EmptyRecipeList = ({ message }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={50} color="#ccc" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>나의 레시피</Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, styles.leftTab, activeTab === 'saved' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' ? styles.activeTabText : styles.inactiveTabText]}>
            찜한 레시피
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, styles.rightTab, activeTab === 'added' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('added')}
        >
          <Text style={[styles.tabText, activeTab === 'added' ? styles.activeTabText : styles.inactiveTabText]}>
            추가한 레시피
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Option & Add Button */}
      <View style={styles.controlContainer}>
        <TouchableOpacity 
          style={styles.sortContainer}
          onPress={() => setSortModalVisible(true)}
        >
          <Text style={styles.sortText}>
            정렬: {sortOption === 'latest' ? '최신순' : '가나다순'}
          </Text>
          <Ionicons name="swap-vertical" size={16} color="#666" />
        </TouchableOpacity>

        {activeTab === 'added' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddRecipeScreen')}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>추가하기</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Modal */}
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
            <Text style={styles.modalTitle}>정렬 기준 선택</Text>
            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'latest' && styles.selectedSortOption]}
              onPress={() => changeSortOption('latest')}
            >
              <Text style={[styles.sortOptionText, sortOption === 'latest' && styles.selectedSortOptionText]}>최신 등록순</Text>
              {sortOption === 'latest' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'alphabetical' && styles.selectedSortOption]}
              onPress={() => changeSortOption('alphabetical')}
            >
              <Text style={[styles.sortOptionText, sortOption === 'alphabetical' && styles.selectedSortOptionText]}>가나다순</Text>
              {sortOption === 'alphabetical' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Recipe List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#666" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard key={recipe.code} recipe={recipe} />
            ))
          ) : (
            <EmptyRecipeList 
              message={activeTab === 'saved' ? "찜한 레시피가 없습니다." : "추가한 레시피가 없습니다."} 
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 50, backgroundColor: '#666' },
    backButton: { padding: 8 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 12 },
    tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, height: 50 },
    tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    leftTab: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
    rightTab: { borderTopRightRadius: 12, borderBottomRightRadius: 12 },
    activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84 },
    inactiveTab: { backgroundColor: '#999' },
    tabText: { fontSize: 16, fontWeight: '500' },
    activeTabText: { color: '#000' },
    inactiveTabText: { color: '#fff' },
    controlContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, marginTop: 20 },
    sortContainer: { flexDirection: 'row', alignItems: 'center' },
    sortText: { fontSize: 14, color: '#666', marginRight: 4 },
    addButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#eef2ff', borderRadius: 20 },
    addButtonText: { fontSize: 14, fontWeight: '500', marginLeft: 4, color: '#007AFF' },
    scrollView: { flex: 1, paddingHorizontal: 16 },
    recipeCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, position: 'relative' },
    deleteButton: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255, 68, 68, 0.8)', alignItems: 'center', justifyContent: 'center', zIndex: 1, elevation: 3 },
    cardTouchable: { padding: 16 },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    imageContainer: { marginRight: 16 },
    imagePlaceholder: { width: 60, height: 60, backgroundColor: '#e0e0e0', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    textContainer: { flex: 1, marginRight: 16 },
    recipeName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    cookingTime: { fontSize: 14, color: '#666', marginBottom: 4 },
    ingredients: { fontSize: 14, color: '#666' },
    arrowContainer: { justifyContent: 'center', alignItems: 'center' },
    arrowText: { fontSize: 18, color: '#666', fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#999', textAlign: 'center', lineHeight: 24 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8 },
    selectedSortOption: { backgroundColor: '#f0f8ff' },
    sortOptionText: { fontSize: 16, color: '#333' },
    selectedSortOptionText: { color: '#007AFF', fontWeight: '500' },
});

export default MyRecipe;