import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const ALL_TOOLS = {
    '프라이팬': 1, '냄비': 2, '웍': 4, '밀대': 8, '믹서기': 16, '핸드블랜더': 32, '거품기': 64,
    '연육기': 128, '착즙기': 256, '전자레인지': 512, '가스레인지': 1024, '오븐': 2048,
    '에어프라이어': 4096, '주전자': 8192, '압력솥': 16384, '토스터': 32768, '찜기': 65536
};

const decodeToolLabels = (mask = 0) => {
    if (!mask || typeof mask !== 'number') return [];
    return Object.keys(ALL_TOOLS).filter(label => (mask & ALL_TOOLS[label]) !== 0);
};

const Divider = () => (
    <View
      style={{
        borderBottomColor: '#fbbf24',
        borderBottomWidth: 1.5,
        marginVertical: 12,
      }}
    >
      <View
        style={{
          borderBottomColor: '#fbbf24',
          borderBottomWidth: 2,
          marginTop: 2,
        }}
      />
    </View>
);

export default function MyRecipeDetailScreen({ route }) {
  const { recipe, isEditable } = route.params;
  const navigation = useNavigation();

  if (!recipe) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>레시피 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const ingredients = recipe.subIngredients || [];
  const toolLabels = decodeToolLabels(recipe.tools);
  const instructionSteps = recipe.recipe?.flatMap(step => step.split('\n').filter(line => line.trim() !== '')) || [];

  return (
    <ScrollView style={{backgroundColor: 'white', flex: 1}} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
      <StatusBar style={"light"} />

      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <View
          style={{
            width: wp(98), height: hp(10), borderRadius: 53, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
            marginTop: 4, backgroundColor: '#ffffff'
          }}
        />
      </View>

      <Animated.View entering={FadeIn.delay(200).duration(1000)} style={{width: '100%', position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56}}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 8, borderRadius: 999, marginLeft: 20, backgroundColor: '#f3f4f6'}}>
          <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
        </TouchableOpacity>
        
       
        {isEditable && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('RecipeFormScreen', { recipe })} 
              style={{
                marginRight: 20,
                backgroundColor: '#f3f4f6',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
              }}
            >
              <Text style={{color: '#fbbf24', fontWeight: 'bold', fontSize: hp(1.8)}}>
                수정하기
              </Text>
            </TouchableOpacity>
        )}
      

      </Animated.View>

      <View style={{paddingHorizontal: 16, flex: 1, justifyContent: 'space-between', paddingTop: 32, gap: 16}}>
        
        <Animated.View entering={FadeInDown.duration(700).springify().damping(12)} style={{gap: 8}}>
            <Text style={{ fontSize: hp(3), fontWeight: 'bold', flex: 1, color: '#404040' }}>
              {recipe?.name ?? '이름 없는 레시피'}
            </Text>
            <Divider />
            {!!recipe?.author && (
              <Text style={{ fontSize: hp(2), fontWeight: '500', flex: 1, color: '#a3a3a3' }}>
                by {recipe.author}
              </Text>
            )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(700).springify().damping(12)} style={{ marginTop: 10 }}>
             <Text style={{fontSize: hp(2.2), fontWeight: '700', color: '#374151', marginBottom: 8 }}>시간</Text>
             <View style={{ backgroundColor: '#fbbf24', borderRadius: 9999, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb', alignSelf: 'flex-start' }}>
                <Text style={{ color: '#374151', fontWeight: '600' }}>
                  ⏱ {recipe?.time || 'N/A'}
                </Text>
             </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(700).springify().damping(12)} style={{ marginTop: 10 }}>
            <Text style={{fontSize: hp(2.2), fontWeight: '700', color: '#374151', marginBottom: 8 }}>도구</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {toolLabels.length === 0 ? (
                <View style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: 1, borderRadius: 9999, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#9a3412', fontWeight: '600' }}>없음</Text>
                </View>
              ) : (
                toolLabels.map((label, idx) => (
                  <View key={idx} style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: 1, borderRadius: 9999, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 4 }}>
                    <Text style={{ color: '#9a3412', fontWeight: '600' }}>{label}</Text>
                  </View>
                ))
              )}
            </View>
        </Animated.View>
        
        {ingredients.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(700).springify().damping(12)} style={{ marginTop: 8 }}>
            <Text style={{ fontSize: hp(2.2), fontWeight: '700', color: '#374151', marginBottom: 8 }}>재료</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {ingredients.map((ing, idx) => (
                <View key={`sub-${idx}`} style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: 1, borderRadius: 9999, paddingVertical: 6, paddingHorizontal: 10, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#9a3412', fontWeight: '600' }}>
                    {ing.name}{ing.count ? ` ${ing.count}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {instructionSteps.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(700).springify().damping(12)} style={{gap: 16}}>
            <Divider />
            <Text style={{ fontSize: hp(2.5), fontWeight: 'bold', flex: 1, color: '#404040' }}>요리순서</Text>
            <View style={{gap: 8}}>
              {instructionSteps.map((step, idx) => (
                <Text key={idx} style={{ fontSize: hp(1.6), color: '#404040' }}>
                  {idx + 1}. {step}
                </Text>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}