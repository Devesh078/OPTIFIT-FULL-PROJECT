import React, { useState } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
TextInput,
ScrollView,
LayoutAnimation,
Platform,
UIManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const workoutLibrary = {
  "Chest + Triceps": [
    { name: "Bench Press", sets: 4, reps: "8-10", icon: "barbell" },
    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", icon: "barbell" },
    { name: "Cable Fly", sets: 3, reps: "12-15", icon: "fitness" },
    { name: "Tricep Pushdown", sets: 3, reps: "10-12", icon: "barbell" },
  ],

  "Back + Biceps": [
    { name: "Pull Ups", sets: 4, reps: "6-10", icon: "body" },
    { name: "Lat Pulldown", sets: 3, reps: "10-12", icon: "barbell" },
    { name: "Barbell Row", sets: 3, reps: "8-10", icon: "barbell" },
    { name: "Barbell Curl", sets: 3, reps: "10-12", icon: "fitness" },
  ],

  "Legs": [
    { name: "Squats", sets: 4, reps: "6-8", icon: "barbell" },
    { name: "Leg Press", sets: 3, reps: "10-12", icon: "barbell" },
    { name: "Lunges", sets: 3, reps: "12", icon: "walk" },
  ],

  "Shoulders": [
    { name: "Overhead Press", sets: 4, reps: "8-10", icon: "barbell" },
    { name: "Lateral Raise", sets: 3, reps: "12-15", icon: "fitness" },
  ],

  "Core": [
    { name: "Plank", sets: 3, reps: "45 sec", icon: "body" },
    { name: "Leg Raises", sets: 3, reps: "15", icon: "body" },
  ],

  "Cardio": [
    { name: "Running", sets: 1, reps: "20 min", icon: "walk" },
    { name: "Cycling", sets: 1, reps: "20 min", icon: "bicycle" },
  ]
};


export default function WorkoutScreen() {

const [tab,setTab] = useState("manual");
const [type,setType] = useState("running");
const [duration,setDuration] = useState("");
const [calories,setCalories] = useState(0);
const [goal,setGoal] = useState("muscle");
const [selectedDay,setSelectedDay] = useState(null);
const [expandedDay,setExpandedDay] = useState(null);
const [completed,setCompleted] = useState({});

/* temporary weight */
const weight = 78;

const MET = {
running:9.8,
cycling:7.5,
strength:6,
walking:3.5,
yoga:2.5
};

const calculateCalories = (minutes,workoutType) => {

const hours = minutes / 60;

return Math.round(MET[workoutType] * weight * hours);

};

const handleDuration = (value) => {

setDuration(value);

if(value){

setCalories(calculateCalories(Number(value),type));

}else{

setCalories(0);

}

};

const handleType = (t) => {

setType(t);

if(duration){

setCalories(calculateCalories(Number(duration),t));

}

};

const musclePlan = [
{day:"Monday",workout:"Chest + Triceps"},
{day:"Tuesday",workout:"Back + Biceps"},
{day:"Wednesday",workout:"Legs"},
{day:"Thursday",workout:"Shoulders"},
{day:"Friday",workout:"Core"},
{day:"Saturday",workout:"Cardio"},
{day:"Sunday",workout:"Rest"}
];

const fatLossPlan = [
{day:"Monday",workout:"HIIT"},
{day:"Tuesday",workout:"Cardio"},
{day:"Wednesday",workout:"Strength"},
{day:"Thursday",workout:"HIIT"},
{day:"Friday",workout:"Cardio"},
{day:"Saturday",workout:"Full Body"},
{day:"Sunday",workout:"Rest"}
];

const plan = goal === "muscle" ? musclePlan : fatLossPlan;
const exerciseLibrary = {

Chest:[
"Bench Press",
"Incline Dumbbell Press",
"Cable Fly",
"Push Ups"
],

Triceps:[
"Tricep Pushdown",
"Overhead Extension",
"Skull Crushers"
],

Back:[
"Pull Ups",
"Lat Pulldown",
"Barbell Row",
"Seated Row"
],

Biceps:[
"Barbell Curl",
"Hammer Curl",
"Preacher Curl"
],

Legs:[
"Squats",
"Leg Press",
"Lunges",
"Hamstring Curl"
],

Shoulders:[
"Overhead Press",
"Lateral Raise",
"Front Raise",
"Rear Delt Fly"
],

Core:[
"Plank",
"Leg Raises",
"Russian Twist",
"Mountain Climbers"
],

Cardio:[
"Running",
"Cycling",
"Jump Rope",
"Row Machine"
]

};

return(

<SafeAreaView style={{flex:1,backgroundColor:"#0F172A"}}>

<ScrollView
style={styles.container}
contentContainerStyle={{paddingBottom:120}}
showsVerticalScrollIndicator={false}
>



{/* Tabs */}

<View style={styles.tabContainer}>

<TouchableOpacity
style={[styles.tab,tab==="manual" && styles.activeTab]}
onPress={()=>{
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setTab("manual")}}
>

<Text style={styles.tabText}>Manual</Text>

</TouchableOpacity>

<TouchableOpacity
style={[styles.tab,tab==="tips" && styles.activeTab]}
onPress={()=>{
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setTab("tips")}}
>

<Text style={styles.tabText}>Tips</Text>

</TouchableOpacity>

</View>

{/* MANUAL WORKOUT */}

{tab==="manual" && (

<>

<Text style={styles.sectionTitle}>
Workout Type
</Text>

<View style={styles.grid}>

<TouchableOpacity
style={[styles.card,type==="running" && styles.activeCard]}
onPress={()=>{
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  handleType("running")}}
>

<Ionicons name="walk" size={26} color="#fff"/>
<Text style={styles.cardText}>Running</Text>

</TouchableOpacity>

<TouchableOpacity
style={[styles.card,type==="cycling" && styles.activeCard]}
onPress={()=>{
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  handleType("cycling")}}
>

<Ionicons name="bicycle" size={26} color="#fff"/>
<Text style={styles.cardText}>Cycling</Text>

</TouchableOpacity>

<TouchableOpacity
style={[styles.card,type==="strength" && styles.activeCard]}
onPress={()=>{
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  handleType("strength")}}
>

<Ionicons name="barbell" size={26} color="#fff"/>
<Text style={styles.cardText}>Strength</Text>

</TouchableOpacity>

<TouchableOpacity
style={[styles.card,type==="walking" && styles.activeCard]}
onPress={()=>{
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  handleType("walking")}}
>

<Ionicons name="walk-outline" size={26} color="#fff"/>
<Text style={styles.cardText}>Walking</Text>

</TouchableOpacity>

<TouchableOpacity
style={[styles.card,type==="yoga" && styles.activeCard]}
onPress={()=>{
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
handleType("yoga")}}
>

<Ionicons name="body" size={26} color="#fff"/>
<Text style={styles.cardText}>Yoga</Text>

</TouchableOpacity>

</View>

<Text style={styles.sectionTitle}>
Duration (minutes)
</Text>

<TextInput
style={styles.input}
placeholder="Enter minutes"
placeholderTextColor="#888"
keyboardType="numeric"
value={duration}
onChangeText={handleDuration}
/>

<Text style={styles.calorieTitle}>
Calories Burn Estimate
</Text>

<View style={styles.calorieCard}>

<Ionicons name="flame" size={28} color="#00E676"/>

<Text style={styles.calorieNumber}>
{calories}
</Text>

<Text style={styles.calorieLabel}>
Estimated Calories Burned
</Text>

</View>

<TouchableOpacity
  style={styles.saveBtn}
  onPress={async () => {
    try {
      if (!duration) {
        alert("Enter duration");
        return;
      }

      // ✅ FIX: map frontend type → backend type
      let backendType = "cardio";

      if (type === "strength") {
        backendType = "strength";
      } else {
        backendType = "cardio";
      }

      await api.post("/workout/log", {
        type: backendType,
        duration: Number(duration),
        intensity: "moderate",
      });

      alert("Workout saved ✅");

    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  }}
>
  <Text style={styles.saveText}>Save Workout</Text>
</TouchableOpacity>

</>

)}

{/* TIPS TAB */}

{tab==="tips" && (

<>

<Text style={styles.sectionTitle}>
Goal
</Text>

<View style={styles.goalRow}>

<TouchableOpacity
style={[styles.goalBtn,goal==="muscle" && styles.goalActive]}
onPress={()=>
{LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
setGoal("muscle")}}
>

<Text style={styles.goalText}>
Build Muscle
</Text>

</TouchableOpacity>

<TouchableOpacity
style={[styles.goalBtn,goal==="fat" && styles.goalActive]}
onPress={()=>{
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setGoal("fat")}}
>

<Text style={styles.goalText}>
Weight Loss
</Text>

</TouchableOpacity>

</View>

{plan.map((item,index)=>{

const expanded = expandedDay === index;

return(

<View key={index}>

<TouchableOpacity
style={styles.tipCard}
onPress={()=>{
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpandedDay(expanded ? null : index)}}
>

<Text style={styles.dayText}>{item.day}</Text>
<Text style={styles.tipText}>{item.workout}</Text>

<Ionicons
name={expanded ? "chevron-up":"chevron-down"}
size={20}
color="#fff"
/>

</TouchableOpacity>

{expanded && workoutLibrary[item.workout] && (

<View style={styles.exerciseContainer}>

{workoutLibrary[item.workout].map((ex,i)=>(
<View key={i} style={styles.exerciseRow}>

<Ionicons name={ex.icon} size={20} color="#00E676"/>

<View style={{flex:1}}>

<Text style={styles.exerciseName}>{ex.name}</Text>

<Text style={styles.exerciseMeta}>
{ex.sets} sets • {ex.reps}
</Text>

</View>

</View>
))}

<TouchableOpacity
style={[
styles.completeBtn,
completed[index] && {backgroundColor:"#22C55E"}
]}
onPress={()=>{
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setCompleted({...completed,[index]:true})}}
>

<Text style={styles.completeText}>
{completed[index] ? "Completed ✅" : "Mark Completed"}
</Text>

</TouchableOpacity>

</View>

)}

</View>

);

})}


{selectedDay && (

<View style={styles.exerciseContainer}>

<Text style={styles.exerciseTitle}>
Exercises for {selectedDay.workout}
</Text>

{selectedDay.workout.split("+").map((muscle,i)=>{

const list = exerciseLibrary[muscle.trim()] || [];

return(

<View key={i}>

<Text style={styles.muscleTitle}>
{muscle.trim()}
</Text>

{list.map((ex,index)=>(
<Text key={index} style={styles.exerciseItem}>
• {ex}
</Text>
))}

</View>

);

})}

</View>

)}


</>

)}

</ScrollView>

</SafeAreaView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#0B1220",
paddingHorizontal:28,
paddingTop:40,
paddingBottom:140
},


tabContainer:{
flexDirection:"row",
backgroundColor:"#1E293B",
borderRadius:16,
padding:4,
marginBottom:20
},

tab:{
flex:1,
padding:12,
alignItems:"center",
borderRadius:12
},

activeTab:{
backgroundColor:"#00E676"
},

tabText:{
color:"#fff",
fontWeight:"bold"
},

sectionTitle:{
color:"#fff",
marginBottom:10,
marginTop:10,
fontSize:16
},

grid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between"
},

card:{
width:"47%",
backgroundColor:"#1E293B",
paddingVertical:26,
borderRadius:18,
alignItems:"center",
marginBottom:16,
borderWidth:1,
borderColor:"#263445"
},

activeCard:{
borderColor:"#00E676",
borderWidth:2
},

cardText:{
color:"#fff",
marginTop:6
},

input:{
backgroundColor:"#1E293B",
borderRadius:14,
padding:14,
color:"#fff",
marginBottom:15
},

calorieTitle:{
color:"#94A3B8",
textAlign:"center"
},

calorieCard:{
backgroundColor:"#1E293B",
paddingVertical:28,
paddingHorizontal:30,
borderRadius:18,
alignItems:"center",
justifyContent:"center",
alignSelf:"center",
width:"80%",
marginVertical:20,
borderWidth:1,
borderColor:"#263445"
},

calorieNumber:{
fontSize:36,
color:"#00E676",
fontWeight:"bold"
},

calorieLabel:{
color:"#94A3B8"
},

saveBtn:{
backgroundColor:"#00E676",
padding:18,
borderRadius:18,
alignItems:"center",
marginTop:20,
marginBottom:30
},


saveText:{
color:"#0F172A",
fontWeight:"bold"
},

goalRow:{
flexDirection:"row",
marginBottom:20
},

goalBtn:{
flex:1,
backgroundColor:"#1E293B",
padding:12,
borderRadius:12,
alignItems:"center",
marginRight:10
},

goalActive:{
backgroundColor:"#00E676"
},

goalText:{
color:"#fff",
fontWeight:"bold"
},

tipCard:{
backgroundColor:"#1E293B",
padding:18,
borderRadius:16,
marginBottom:12
},

dayText:{
color:"#fff",
fontWeight:"bold",
marginBottom:4
},

tipText:{
color:"#94A3B8"
},

workoutGrid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between",
marginTop:20,
marginBottom:20,
paddingHorizontal:2
},


workoutCard:{
width:"48%",
backgroundColor:"#1E293B",
paddingVertical:26,
borderRadius:18,
alignItems:"center",
marginBottom:16
},

durationInput:{
backgroundColor:"#1E293B",
borderRadius:16,
padding:10,
color:"#fff",
marginTop:10,
marginBottom:25
},

exerciseContainer:{
backgroundColor:"#1E293B",
padding:18,
borderRadius:16,
marginTop:10
},

exerciseTitle:{
color:"#fff",
fontWeight:"bold",
fontSize:16,
marginBottom:10
},  

muscleTitle:{
color:"#00E676",
marginTop:10,
marginBottom:4,
fontWeight:"bold"
},

exerciseItem:{
color:"#94A3B8",
marginLeft:6,
marginBottom:4
},

exerciseContainer:{
backgroundColor:"#1E293B",
borderRadius:14,
padding:16,
marginBottom:10
},

exerciseRow:{
flexDirection:"row",
alignItems:"center",
marginBottom:12,
gap:10
},

exerciseName:{
color:"#fff",
fontWeight:"bold"
},

exerciseMeta:{
color:"#94A3B8",
fontSize:12
},

completeBtn:{
backgroundColor:"#00E676",
padding:12,
borderRadius:10,
marginTop:10,
alignItems:"center"
},

completeText:{
color:"#0F172A",
fontWeight:"bold"
}



});
