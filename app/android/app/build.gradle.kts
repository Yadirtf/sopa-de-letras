import java.util.Properties

plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Firma de release: si existe android/key.properties (CI la crea desde los
// secretos del repo) se usa ese keystore; si no, se firma con la clave debug
// para que la APK siga siendo instalable al compilar en local.
val keystoreProperties = Properties().apply {
    val file = rootProject.file("key.properties")
    if (file.exists()) file.inputStream().use { load(it) }
}

// Firebase (avisos push): en lugar del plugin google-services se leen los
// valores de android/app/google-services.json y se exponen como recursos,
// que es lo único que Firebase necesita para arrancar. Si el archivo no
// existe la APK compila igual y la app funciona sin avisos con la app cerrada.
// En CI el archivo se crea desde el secreto GOOGLE_SERVICES_JSON.
fun firebaseResources(file: File, packageName: String): Map<String, String> {
    if (!file.exists()) return emptyMap()
    val root = groovy.json.JsonSlurper().parse(file) as Map<*, *>
    val project = root["project_info"] as Map<*, *>
    val client = (root["client"] as List<*>).map { it as Map<*, *> }.firstOrNull {
        val info = (it["client_info"] as Map<*, *>)["android_client_info"] as Map<*, *>
        info["package_name"] == packageName
    } ?: error("google-services.json no tiene una app Android con el paquete $packageName")
    val apiKey = ((client["api_key"] as List<*>).first() as Map<*, *>)["current_key"] as String
    val values = mutableMapOf(
        "google_app_id" to ((client["client_info"] as Map<*, *>)["mobilesdk_app_id"] as String),
        "gcm_defaultSenderId" to (project["project_number"] as String),
        "google_api_key" to apiKey,
        "google_crash_reporting_api_key" to apiKey,
        "project_id" to (project["project_id"] as String),
    )
    (project["storage_bucket"] as String?)?.let { values["google_storage_bucket"] = it }
    return values
}

android {
    namespace = "com.example.wordhive_app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "com.example.wordhive_app"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName

        firebaseResources(file("google-services.json"), "com.example.wordhive_app").forEach { (name, value) ->
            resValue("string", name, value)
        }
    }

    buildFeatures {
        resValues = true
    }

    signingConfigs {
        if (keystoreProperties.isNotEmpty()) {
            create("release") {
                storeFile = file(keystoreProperties.getProperty("storeFile"))
                storePassword = keystoreProperties.getProperty("storePassword")
                keyAlias = keystoreProperties.getProperty("keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.findByName("release") ?: signingConfigs.getByName("debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")
}
