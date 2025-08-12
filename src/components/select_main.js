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

export default function Select_main() {
  const route = useRoute();
  const { selectedIngredients } = route.params;

  const navigation = useNavigation();
  const [MainIngredient, setMainIngredient] = useState('♥');

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)} className="flex-1 space-y-4 flex-col">
        <StatusBar hidden={true} />

        {/* 뒤로가기 */}
        <Animated.View entering={FadeIn.delay(200).duration(1000)} className="w-full flex-row justify-between items-center pt-14">
            <TouchableOpacity onPress={()=> navigation.goBack()} className="p-2 rounded-full ml-5 bg-gr">
                <ChevronLeftIcon  strokeWidth={4.5} color="#fbbf24" />
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> navigation.navigate('Recommend')} className="p-2 rounded-full mr-5 bg-gr">
                <Text style={{fontSize: hp(2)}} className='text-ye font-bold'>완료</Text>
            </TouchableOpacity>
        </Animated.View>

        {/* 재료 리스트 */}
        <View style={{flex: 0.3}} className="mx-10">
          <ScrollView contentContainerStyle={styles.ingredientsWrap}>
            {selectedIngredients.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setMainIngredient(item)}
              style={styles.ingredientButton}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 메인 재료 보여주기 */}
        <View className="mx-10 items-center justify-center" style={{flex: 0.2}}>
          <View className="mb-10 items-center justify-center" style={[styles.selectedBox, {backgroundColor: '#d9d9d9',}]}>
            <Text className="px-4 font-semibold" style={{ fontSize: 40, color: 'black', textAlign: 'center'}}>{MainIngredient}</Text>
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