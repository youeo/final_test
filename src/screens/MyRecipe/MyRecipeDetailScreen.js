import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const MyRecipeDetailScreen = ({ navigation, route }) => {
  const { recipe, isEditable } = route.params;

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>레시피 정보를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- ## 재료 목록을 subIngredients만 사용하도록 수정 ## ---
  const ingredientsToDisplay = recipe.subIngredients || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* --- ## 헤더 UI 수정 (공유 버튼 제거) ## --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>레시피 상세</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* --- ## 전체적인 레이아웃 및 스타일 개선 ## --- */}
        <View style={styles.titleSection}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <View style={styles.metaInfo}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.metaText}>{recipe.time || '정보 없음'}</Text>
            </View>
        </View>

        {isEditable && (
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditRecipeScreen', { recipe })}>
              <Ionicons name="create-outline" size={18} color="#4b5563" />
              <Text style={styles.editButtonText}>레시피 수정</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료</Text>
          {ingredientsToDisplay.length > 0 ? (
            ingredientsToDisplay.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientCount}>{ingredient.count || ''}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>추가 재료 정보가 없습니다.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>조리 과정</Text>
          {recipe.recipe && recipe.recipe.length > 0 ? (
            recipe.recipe.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))
           ) : (
            <Text style={styles.noDataText}>조리 과정 정보가 없습니다.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: hp(7), paddingBottom: hp(2), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerButton: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 999, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: hp(2.2), fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    contentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    titleSection: { paddingVertical: 24 },
    recipeName: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 12, lineHeight: 36 },
    metaInfo: { flexDirection: 'row', alignItems: 'center' },
    metaText: { marginLeft: 8, fontSize: 14, color: '#6b7280' },
    editButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#f3f4f6', borderRadius: 20, marginBottom: 32 },
    editButtonText: { marginLeft: 8, fontSize: 14, color: '#4b5563', fontWeight: '600' },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    ingredientItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
    ingredientName: { fontSize: 16, color: '#374151' },
    ingredientCount: { fontSize: 16, color: '#6b7280' },
    stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    stepNumber: { fontSize: 16, fontWeight: 'bold', color: '#fbbf24', marginRight: 12, width: 24, textAlign: 'right' },
    stepText: { fontSize: 16, color: '#374151', flex: 1, lineHeight: 24 },
    noDataText: { fontSize: 16, color: '#9ca3af', textAlign: 'center', paddingVertical: 20 }
});

export default MyRecipeDetailScreen;