import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Expo from "expo";
import Dialog, { DialogContent } from "react-native-popup-dialog";
import { Container, Text, Thumbnail, Label } from "native-base";
import { LoginPageStyle as styles } from "../../styles";
import { useMutation } from "@apollo/react-hooks";
import { LOGIN_USER } from "../../graphql/mutations/login/loginMutation";
import * as SecureStore from "expo-secure-store";
import * as Facebook from "expo-facebook";

console.disableYellowBox = true;

export default function LoginPage({ navigation }) {
  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [popup, setPopup] = useState({
    error: "",
    visible: false,
  });

  const [login] = useMutation(LOGIN_USER);

  function onChangeHandler(event, name) {
    event.persist();
    setLoginDetails({
      ...loginDetails,
      [name]: event.nativeEvent.text,
    });
  }

  async function LoginHandler(event) {
    event.preventDefault();
    const res = await login({
      variables: {
        username: loginDetails.username.toLowerCase(),
        password: loginDetails.password,
      },
    }).catch((res) => {
      const errors = res.graphQLErrors.map((error) => {
        return error.message;
      });
      Alert.alert(res.graphQLErrors[0].message);
    });

    if (res.data.tokenAuth) {
      await SecureStore.setItemAsync("jwt_token", res.data.tokenAuth.token);
      await SecureStore.setItemAsync("UserId", res.data.tokenAuth.user.id);
      await SecureStore.setItemAsync(
        "UserName",
        res.data.tokenAuth.user.username
      );
      navigation.navigate("HomePage");
    }
  }

  async function SignInGoogle() {
    try {
      const res = await Expo.Google.logInAsync({
        androidClientId:
          "284630498860-sop6b4k3em7soqbusut38ck5t5vji0qe.apps.googleusercontent.com",
        scopes: ["profile", "email"],
      });

      if (res.type === "success") {
        console.log("Nice", res);
      } else {
        // setPopup({
        //   ...popup,
        //   error: "Google Sign in Failed",
        //   visible: true
        // });
      }
    } catch (e) {
      console.log("errors", e);
    }
  }

  // async function facebookLogIn() {
  //   try {
  //     await Facebook.initializeAsync("917890541970069");
  //     const {
  //       type,
  //       token,
  //       expires,
  //       permissions,
  //       declinedPermissions,
  //     } = await Facebook.logInWithReadPermissionsAsync({
  //       permissions: ["public_profile"],
  //     });
  //     if (type === "success") {
  //       // Get the user's name using Facebook's Graph API
  //       const response = await fetch(
  //         `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`
  //       );
  //       Alert.alert("Logged in!", `Hi ${(await response.json()).name} `);
  //     } else {
  //       // type === 'cancel'
  //     }
  //   } catch ({ message }) {
  //     alert(`Facebook Login Error: ${message}`);
  //   }
  // }

  const [isLoggedin, setLoggedinStatus] = useState(false);
  const [userData, setUserData] = useState(null);

  async function facebookLogIn() {
    try {
      await Facebook.initializeAsync("917890541970069");
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync("917890541970069", {
        permissions: ["public_profile"],
      });
      if (type === "success") {
        // Get the user's name using Facebook's Graph API
        fetch(
          `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`
        )
          .then((response) => response.json())
          .then((data) => {
            setLoggedinStatus(true);
            setUserData(data);
          })
          .catch((e) => console.log(e));
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  async function logout() {
    setLoggedinStatus(false);
    setUserData(null);
  }

  return isLoggedin ? (
    userData ? (
      <View style={styles.container}>
        <Text style={{ fontSize: 22, marginVertical: 10 }}>
          Hi {userData.name}!
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={{ color: "red" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    ) : null
  ) : (
    <Container style={styles.container}>
      <Text style={styles.signInText}> Sign in </Text>
      <View style={styles.inputContainer}>
        <Label>Mobile no. / Email</Label>
        <TextInput
          style={styles.textInput}
          onChange={(event) => onChangeHandler(event, "username")}
        />
      </View>
      <View style={styles.inputContainer}>
        <Label>Password</Label>
        <TextInput
          secureTextEntry={true}
          style={styles.textInput}
          onChange={(event) => onChangeHandler(event, "password")}
        />
      </View>
      <TouchableOpacity
        onPress={(event) => LoginHandler(event)}
        style={styles.loginButton}
      >
        <Text uppercase={false} style={styles.loginText}>
          Login
        </Text>
      </TouchableOpacity>
      <View style={styles.midContainer}>
        <View style={styles.line} />
        <Text style={styles.signInLabel}>or sign in with one click</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={facebookLogIn}>
          <Thumbnail
            source={{
              uri: "https://www.facebook.com/images/fb_icon_325x325.png",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={SignInGoogle}>
          <Thumbnail
            source={{ uri: "https://blog.hubspot.com/hubfs/image8-2.jpg" }}
            onPress={SignInGoogle}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.registerText}
        onPress={() => navigation.navigate("RegistrationPage")}
      >
        <Text style={styles.noAccountLabel}>
          Don't have an account yet? Register here!
        </Text>
      </TouchableOpacity>

      {/* <Dialog
        visible={popup.visible}
        onTouchOutside={() => {
          setPopup({ ...popup, error: "", visible: false });
        }}
      >
        <DialogContent>
          <Text style={{ fontSize: 48 }}>{popup.error}</Text>
        </DialogContent>
      </Dialog> */}
    </Container>
  );
}

// import React, { useState } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import * as Facebook from "expo-facebook";

// console.disableYellowBox = true;

// export default function App() {
//   const [isLoggedin, setLoggedinStatus] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [isImageLoading, setImageLoadStatus] = useState(false);

//   async function facebookLogIn() {
//     try {
//       await Facebook.initializeAsync("917890541970069");
//       const {
//         type,
//         token,
//         expires,
//         permissions,
//         declinedPermissions,
//       } = await Facebook.logInWithReadPermissionsAsync("917890541970069", {
//         permissions: ["public_profile"],
//       });
//       if (type === "success") {
//         // Get the user's name using Facebook's Graph API
//         fetch(
//           `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture.height(500)`
//         )
//           .then((response) => response.json())
//           .then((data) => {
//             setLoggedinStatus(true);
//             setUserData(data);
//           })
//           .catch((e) => console.log(e));
//       } else {
//         // type === 'cancel'
//       }
//     } catch ({ message }) {
//       alert(`Facebook Login Error: ${message}`);
//     }
//   }

//   async function logout() {
//     setLoggedinStatus(false);
//     setUserData(null);
//     setImageLoadStatus(false);
//   }

//   return isLoggedin ? (
//     userData ? (
//       <View style={styles.container}>
//         <Image
//           style={{ width: 200, height: 200, borderRadius: 50 }}
//           source={{ uri: userData.picture.data.url }}
//           onLoadEnd={() => setImageLoadStatus(true)}
//         />
//         <ActivityIndicator
//           size="large"
//           color="#0000ff"
//           animating={!isImageLoading}
//           style={{ position: "absolute" }}
//         />
//         <Text style={{ fontSize: 22, marginVertical: 10 }}>
//           Hi {userData.name}!
//         </Text>
//         <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
//           <Text style={{ color: "#fff" }}>Logout</Text>
//         </TouchableOpacity>
//       </View>
//     ) : null
//   ) : (
//     <View style={styles.container}>
//       {/* <Image
//         style={{
//           width: 200,
//           height: 200,
//           borderRadius: 50,
//           marginVertical: 20,
//         }}
//         source={require("./assets/reactjs-logo.png")}
//       /> */}
//       <TouchableOpacity style={styles.loginBtn} onPress={facebookLogIn}>
//         <Text style={{ color: "#fff" }}>Login with Facebooks</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#e9ebee",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loginBtn: {
//     backgroundColor: "#4267b2",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   logoutBtn: {
//     backgroundColor: "grey",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     position: "absolute",
//     bottom: 0,
//   },
// });
