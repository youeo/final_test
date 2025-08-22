import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, FlatList, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function AiRecommend() {
  const navigation = useNavigation();
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    fetch('http://43.200.200.161:8080/api/recipes/Recipetoday')
      .then(res => res.json())
      .then(data => setMeals(data))
      .catch(err => console.error(err));
  }, []);

  const numColumns = 2;
  const imageSize = (Dimensions.get('window').width - wp(12)) / 2;

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden={true} />

      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-12 left-5 z-10 p-2 rounded-full bg-gr"
      >
        <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: hp(12), paddingBottom: hp(5), paddingHorizontal: wp(5) }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)}>
          <Text style={{ fontSize: hp(2.3) }} className="font-semibold text-neutral-700 text-center mb-4">
            오늘의 추천 레시피
          </Text>

          <FlatList
            data={meals}
            numColumns={numColumns}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}  // ScrollView 안에서 스크롤 안 겹치도록
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: hp(2) }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
              >
                <Image
                  source={{ uri: item.image }} // 서버에서 받은 이미지 필드 이름에 맞게 변경
                  style={{
                    width: imageSize,
                    height: hp(25),
                    borderRadius: 16,
                    backgroundColor: '#f3f3f3',
                  }}
                  resizeMode="cover"
                />
                <Text style={{ width: imageSize, textAlign: 'center', marginTop: 4 }} numberOfLines={1}>
                  {item.title} {/* 서버 데이터에 맞춰 title 필드 사용 */}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
