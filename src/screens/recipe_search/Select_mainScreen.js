import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Button, Pressable, Modal, ScrollView, FlatList } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import AntDesign from '@expo/vector-icons/AntDesign';

// backgroundColor: 'papayawhip' 이 색상 이쁘다

export default function Select_mainScreen() {
  const route = useRoute();
  const { selectedIngredients = [], Type = 0 } = route.params || {};
  // 받아오는 부분 세팅
  const ingredientNames = (selectedIngredients || []).map(i => typeof i === 'string' ? i : i?.name).filter(Boolean);
  const [MainIngredient, setMainIngredient] = useState('♥');

  const navigation = useNavigation();

  useEffect(() => {
    if (!MainIngredient && ingredientNames.length > 0) {
      setMainIngredient(ingredientNames[0]);
    }
  }, [ingredientNames]);

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)} className="flex-1 space-y-4 flex-col">
        <StatusBar hidden={true} />

        <Animated.View entering={FadeIn.delay(200).duration(1000)} className="w-full flex-row justify-between items-center pt-14">
            {/* 뒤로가기 */}
            <TouchableOpacity onPress={()=> navigation.goBack()} className="p-2 rounded-full ml-5 bg-gr">
                <ChevronLeftIcon  strokeWidth={4.5} color="#fbbf24" />
            </TouchableOpacity>
            {/* 재료 배열 넘겨주기 */}
            <TouchableOpacity
              onPress={() => {
                // 1) 이름 목록 (문자/객체 혼용 안전 처리)
                const names = (selectedIngredients || [])
                  .map(i => (typeof i === 'string' ? i : i?.name))
                  .filter(Boolean);

                // 2) 메인/서브 분리 (메인은 현재 선택된 MainIngredient 기준)
                const mainNames = names.filter(n => n === MainIngredient);          // 최대 1~2개라면 여기에 로직 확장
                const subNames  = names.filter(n => n !== MainIngredient);

                // 3) 서버가 기대하는 객체 형태로 정규화 {name, count, type}
                const toObj = (n) => {
                  const src = (selectedIngredients || []).find(i => (typeof i === 'object' && i?.name === n));
                  return {
                    name: n,
                    count: src?.count ?? '',   // 없으면 빈 값
                    type:  src?.type  ?? 0,    // 없으면 0 등 기본값
                  };
                };

                const mainIngredients = mainNames.map(toObj);
                const subIngredients  = subNames.map(toObj);

                if (mainIngredients.length === 0 && subIngredients.length === 0) {
                  // 아무것도 선택 안 했으면 이동 막기 (선택)
                  return;
                }

                navigation.navigate('Recommend', { mainIngredients, subIngredients, Type, });
              }}
              className="p-2 rounded-full mr-5 bg-gr"
            >
              <Text style={{fontSize: hp(2)}} className='text-ye font-bold'>완료</Text>
            </TouchableOpacity>
        </Animated.View>

        {/* 재료 리스트 */}
        <View style={{flex: 0.3}} className="mx-10">
          <ScrollView contentContainerStyle={styles.ingredientsWrap}>
            {ingredientNames.map((name, index) => (
              <TouchableOpacity key={index} onPress={() => setMainIngredient(name)} style={styles.ingredientButton}>
                <Text>{name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 메인 재료 보여주기 */}
        <View className="mx-10 items-center justify-center" style={{flex: 0.2}}>
          <View className="mb-10 items-center justify-center" style={[styles.selectedBox, {backgroundColor: '#d9d9d9',}]}>
            <Text className="px-4 font-semibold" style={{ fontSize: 40, color: 'black', textAlign: 'center'}}>{MainIngredient || '♥'}</Text>
          </View>
        </View>

        <View style={[styles.selectedBox, {flex: 0.4}]}>
          <Text className="mx-10" style={{ fontSize: hp(4.6), color: 'black', marginBottom: 5, textAlign: 'center', fontWeight: 'bold' }}>요리의 주인공을 골라주세요!</Text>
        </View>


    </Animated.View>
  )
}

const styles = StyleSheet.create({
  ingredientsWrap: {
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
    flexDirection: 'row', flexWrap: 'wrap', marginLeft: 11, marginRight: 11,
  },
  ingredientButton: {
    backgroundColor: '#d9d9d9', fontSize: hp(1.6), padding: 10, borderRadius: 20, margin: 5,
  },
  selectedBox: {
    padding: 15, borderRadius: 100, marginTop: 20, paddingTop: 10,
  },
  selectedChip: {
    backgroundColor: '#d9d9d9', fontSize: hp(1.6), borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    flexDirection: 'row', alignItems: 'center', marginRight: 10, marginTop: 25, marginBottom: 25,
  },
});