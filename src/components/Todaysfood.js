import { View, Text, Image} from 'react-native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, { FadeInDown } from 'react-native-reanimated';
import React from 'react'

/*export default function Todaysfood() {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)}>
      <View className="space-y-3">
          <View className="flex-row justify-between items-center pt-2 pb-2 bg-ye">
              <Text style={{fontSize: hp(2)}} className="mx-4 font-semibold text-gr">오늘의 식재료 상식</Text>
          </View>

          <View className="space-y-2 flex-col justify-center items-center pt-4 pb-4">
              <Image source={require('../../assets/images/carrot.jpg')} style={{borderRadius: 30, height: hp(20), width: hp(40)}}/>
              <View className="flex-row">
                <Text className="text-lg font-bold">당근</Text>
                <Text className="ml-1 pt-2 justify-center items-center">의 효능....</Text>
              </View>
              <Text className="mx-4">당근에는 베타카로틴, 비타민 A, 펙틴, 리그닌 등이 풍부하게 함유되어 있어 다양한 효능이 있습니다. 
                  시력 보호 및 야맹증 예방: 베타카로틴이 비타민 A로 변하면서 시력 보호에 도움이 됩니다. 
                  암 예방: 베타카로틴의 항산화 성분이 암 예방에 도움이 됩니다. 
                  혈압과 혈당, 혈중 콜레스테롤 수치 낮추기: 당근을 생으로 먹거나 갈아서 먹으면 혈압과 혈당, 혈중 콜레스테롤 수치를 낮추는 효과가 있습니다. 
                  빈혈 예방: 비타민 A와 철분이 조혈작용을 돕고 혈액순환을 좋게 합니다. 
                  변비 예방: 식이섬유가 대변의 부피를 늘리고 부드럽게 해 변비를 개선합니다. 
                  설사 멈춤: 펙틴이 정장작용을 해 설사를 멎게 합니다. 
                  피부 질환 치료: 소염작용이 뛰어나 피부 모공 속의 병균을 죽이고, 습진을 낫게 하고 염증을 예방합니다. 
                  피로회복: 강장, 피로회복에 좋습니다. 
                  호흡과 위장이나 허파 건강: 원활한 호흡과 위장이나 허파를 건강하게 해 줍니다. 
                  당근을 고를 때는 색이 진하고 껍질이 매끄럽고 표면에 잔뿌리가 적고 단단하고 휘거나 부러지지 않은 것을 선택하는 것이 좋습니다. </Text>
          </View>
      </View>
    </Animated.View>
  )
}*/

// 홈화면에서는 식재료 이미지만 보이고 버튼을 누르면 설명이 뜨도록 수정
export default function Todaysfood() {
  return (
    <View className="items-center py-2">
      <Image
        source={require('../../assets/images/carrot.jpg')} // 원하는 이미지
        style={{ width: wp(90), height: hp(20), borderRadius: 15 }}
        resizeMode="cover"
      />
    </View>
  );
}
