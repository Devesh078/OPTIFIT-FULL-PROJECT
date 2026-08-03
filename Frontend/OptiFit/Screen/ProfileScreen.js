import React, { useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
ScrollView,
Modal,
TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function ProfileScreen({ setIsLoggedIn }) {

const [user,setUser] = useState(null);
const [editVisible,setEditVisible] = useState(false);

const [name,setName] = useState("");
const [weight,setWeight] = useState("");
const [height,setHeight] = useState("");
const [goal,setGoal] = useState("");
const [gender,setGender] = useState("");
const [streak, setStreak] = useState(0);
const [weeklyCalories, setWeeklyCalories] = useState([0,0,0,0,0,0,0]);

useEffect(()=>{
loadProfile();
},[]);

const loadProfile = async () => {

try{

const res = await api.get("/auth/profile");

setUser(res.data);

setName(res.data.name);
setWeight(String(res.data.weight));
setHeight(String(res.data.height));
setGoal(res.data.goal);
setGender(res.data.gender);
}catch(err){

console.log(err);

}
// ✅ Load streak
try {
  const streakRes = await api.get("/workout/streak");
  setStreak(streakRes.data.streak);
} catch (e) {
  console.log("Streak error:", e);
}

// ✅ Load weekly calories
try {
  const calRes = await api.get("/workout/weekly-calories");
  setWeeklyCalories(calRes.data.weeklyCalories);
} catch (e) {
  console.log("Weekly calories error:", e);
}
};

const calculateBMI = () => {

if(!weight || !height) return "--";

const h = height / 100;

return (weight / (h*h)).toFixed(1);

};

const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    setIsLoggedIn(false);
  } catch (error) {
    console.log(error);
  }
};
const handleSaveProfile = async () => {
  try {

    if (gender !== "male" && gender !== "female") {
      alert("Gender must be 'male' or 'female'");
      return;
    }

    await api.put("/auth/profile", {
      name,
      weight: Number(weight),
      height: Number(height),
      goal,
      gender
    });

    setEditVisible(false);

    loadProfile();

  } catch (err) {
    console.log("PROFILE ERROR:", err.response?.data || err.message);
  }
};
return(

<SafeAreaView style={styles.safe}>

<ScrollView contentContainerStyle={{paddingBottom:120}}>

{/* PROFILE HEADER */}

<View style={styles.headerCard}>

<View style={styles.avatar}>
<Ionicons name="person" size={40} color="#fff"/>
</View>

<Text style={styles.name}>{user?.name}</Text>
<Text style={styles.email}>{user?.email}</Text>

<TouchableOpacity
style={styles.editBtn}
onPress={() => setEditVisible(true)}
>
<Text style={styles.editText}>Edit Profile</Text>
</TouchableOpacity>


</View>

{/* FITNESS STATS */}

<View style={styles.statsRow}>

<View style={styles.statCard}>
<Text style={styles.statValue}>{weight}</Text>
<Text style={styles.statLabel}>Weight</Text>
</View>

<View style={styles.statCard}>
<Text style={styles.statValue}>{height}</Text>
<Text style={styles.statLabel}>Height</Text>
</View>
<View style={styles.statCard}>
<Text style={styles.statValue}>{calculateBMI()}</Text>
<Text style={styles.statLabel}>BMI</Text>
</View>

</View>

{/* WORKOUT STREAK */}

<View style={styles.sectionCard}>

<Text style={styles.sectionTitle}>Workout Streak</Text>

<View style={styles.streakRow}>

<Ionicons name="flame" size={26} color="#00E676"/>

<Text style={styles.streakText}>
{streak} Days Active
</Text>

</View>

</View>

{/* WEEKLY PROGRESS */}

<View style={styles.sectionCard}>

<Text style={styles.sectionTitle}>Weekly Calories Burned</Text>

<LineChart
  data={{
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    datasets: [{ data: weeklyCalories.length === 7 ? weeklyCalories : [0,0,0,0,0,0,0] }],
  }}
  width={Dimensions.get("window").width - 80}
  height={120}
  withDots={true}
  withInnerLines={false}
  withOuterLines={false}
  fromZero={true}
  bezier
  chartConfig={{
    backgroundGradientFrom: "#0F172A",
    backgroundGradientTo: "#0F172A",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 230, 118, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  }}
  style={{ borderRadius: 12 }}
/>

</View>

{/* LOGOUT */}

<TouchableOpacity
style={styles.logoutBtn}
onPress={handleLogout}
>

<Ionicons name="log-out-outline" size={22} color="#0F172A"/>

<Text style={styles.logoutText}>Logout</Text>

</TouchableOpacity>

</ScrollView>

{/* EDIT PROFILE MODAL */}

<Modal visible={editVisible} transparent animationType="slide">

<View style={styles.modalOverlay}>

<View style={styles.modalCard}>

<Text style={styles.modalTitle}>Edit Profile</Text>

<TextInput
placeholder="Name"
placeholderTextColor="#888"
style={styles.input}
value={name}
onChangeText={setName}
/>

<TextInput
placeholder="Weight"
placeholderTextColor="#888"
style={styles.input}
value={weight}
onChangeText={setWeight}
keyboardType="numeric"
/>

<TextInput
placeholder="Height"
placeholderTextColor="#888"
style={styles.input}
value={height}
onChangeText={setHeight}
keyboardType="numeric"
/>
<TextInput
placeholder="Gender (male/female)"
placeholderTextColor="#888"
style={styles.input}
value={gender}
onChangeText={setGender}
/>
<TextInput
placeholder="Goal"
placeholderTextColor="#888"
style={styles.input}
value={goal}
onChangeText={setGoal}
/>

<TouchableOpacity
style={styles.saveBtn}
onPress={handleSaveProfile}
>

<Text style={styles.saveText}>Save</Text>

</TouchableOpacity>

</View>

</View>

</Modal>

</SafeAreaView>

);

}

const styles = StyleSheet.create({

safe:{
flex:1,
backgroundColor:"#0F172A"
},

headerCard:{
backgroundColor:"#1E293B",
margin:20,
borderRadius:20,
alignItems:"center",
paddingVertical:30
},

avatar:{
width:80,
height:80,
borderRadius:40,
backgroundColor:"#00E676",
justifyContent:"center",
alignItems:"center",
marginBottom:10
},

name:{
color:"#fff",
fontSize:20,
fontWeight:"bold"
},

email:{
color:"#94A3B8"
},

editBtn:{
marginTop:10,
paddingHorizontal:16,
paddingVertical:6,
borderRadius:10,
backgroundColor:"#00E676"
},

editText:{
fontWeight:"bold"
},

statsRow:{
flexDirection:"row",
justifyContent:"space-between",
marginHorizontal:20,
marginBottom:20
},

statCard:{
flex:1,
backgroundColor:"#1E293B",
marginHorizontal:5,
padding:20,
borderRadius:16,
alignItems:"center"
},

statValue:{
color:"#fff",
fontSize:18,
fontWeight:"bold"
},

statLabel:{
color:"#94A3B8",
fontSize:12
},

sectionCard:{
backgroundColor:"#1E293B",
marginHorizontal:20,
marginBottom:20,
padding:20,
borderRadius:16
},

sectionTitle:{
color:"#fff",
fontWeight:"bold",
marginBottom:10
},

streakRow:{
flexDirection:"row",
alignItems:"center",
gap:10
},

streakText:{
color:"#fff",
fontSize:16
},

fakeChart:{
height:100,
backgroundColor:"#0F172A",
borderRadius:10,
justifyContent:"center",
alignItems:"center"
},

logoutBtn:{
flexDirection:"row",
justifyContent:"center",
alignItems:"center",
backgroundColor:"#00E676",
marginHorizontal:20,
padding:16,
borderRadius:16,
gap:10
},

logoutText:{
fontWeight:"bold",
color:"#0F172A"
},

modalOverlay:{
flex:1,
backgroundColor:"rgba(0,0,0,0.6)",
justifyContent:"center",
alignItems:"center"
},

modalCard:{
backgroundColor:"#1E293B",
width:"85%",
padding:20,
borderRadius:16
},

modalTitle:{
color:"#fff",
fontWeight:"bold",
fontSize:18,
marginBottom:10
},

input:{
backgroundColor:"#0F172A",
color:"#fff",
padding:12,
borderRadius:10,
marginBottom:10
},

saveBtn:{
backgroundColor:"#00E676",
padding:14,
borderRadius:12,
alignItems:"center"
},

saveText:{
fontWeight:"bold",
color:"#0F172A"
}

});