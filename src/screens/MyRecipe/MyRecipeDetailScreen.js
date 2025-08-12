import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MyRecipeDetailScreen = ({ navigation, route }) => {
  // ## 이전 화면에서 recipe 객체를 직접 받음 ##
  const { recipe } = route.params;

  // recipe 객체가 없는 경우에 대한 예외 처리
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>레시피 정보를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // mainIngredients와 subIngredients를 하나의 배열로 합침
  const allIngredients = [
      ...(recipe.mainIngredients || []), 
      ...(recipe.subIngredients || [])
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => Alert.alert('공유', '공유 기능은 추후 구현 예정입니다.')}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          <Image 
            // ## 이미지가 없을 경우를 대비한 임시 이미지 ##
            source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/400x250/FFC0CB/000000?text=My+Recipe' }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
        </View>

        {/* Recipe Info */}
        <View style={styles.contentContainer}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.recipeDescription}>
            {recipe.time ? `조리시간: ${recipe.time}` : '맛있는 요리를 즐겨보세요!'}
          </Text>

          {/* '추가한 레시피'일 경우에만 수정 버튼 표시 (서버 author 필드 등으로 확인 필요) */}
          {/* 현재는 임시로 항상 표시되게 함 */}
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditRecipeScreen', { recipe })}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.editButtonText}>수정하기</Text>
          </TouchableOpacity>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>재료</Text>
            {allIngredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>
                  {ingredient.name} {ingredient.count || ''}
                </Text>
              </View>
            ))}
          </View>

          {/* Recipe Steps Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>레시피</Text>
            {/* ## 서버에서 받은 recipe.recipe 필드는 이미 배열 ## */}
            {recipe.recipe && recipe.recipe.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1 },
    imageContainer: { height: 250, backgroundColor: '#f0f0f0' },
    recipeImage: { width: '100%', height: '100%' },
    contentContainer: { padding: 20 },
    recipeName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    recipeDescription: { fontSize: 16, color: '#666', marginBottom: 20, lineHeight: 22 },
    editButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f0f8ff', borderRadius: 20, marginBottom: 24 },
    editButtonText: { marginLeft: 6, fontSize: 16, color: '#007AFF', fontWeight: '500' },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
    ingredientItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    bulletPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#333', marginRight: 12 },
    ingredientText: { fontSize: 16, color: '#333', flex: 1 },
    stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    stepNumber: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginRight: 12, minWidth: 24 },
    stepText: { fontSize: 16, color: '#333', flex: 1, lineHeight: 22 },
});

export default MyRecipeDetailScreen;