plugins {
    kotlin("js") version "1.9.0"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.0"
}

group = "com.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation(npm("react", "18.3.1"))
    implementation(npm("react-dom", "18.3.1"))
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    implementation("org.jetbrains.kotlin-wrappers:kotlin-react:18.3.1-pre.672")
    implementation("org.jetbrains.kotlin-wrappers:kotlin-react-dom:18.3.1-pre.672")
}

kotlin {
    js(IR) {
        browser {
            binaries.executable()
            commonWebpackConfig {
                cssSupport.enabled = true
            }
        }
    }
}
