import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// Build file of the Visual settings editor test bundle. It is laid over a copy of
// MorpheApp/morphe-patches by visual-editor/bundle/build.py, with every official patch removed,
// so the bundle holds one patch and can be used next to the official bundle without clashes.

group = "app.morphe"

patches {
    about {
        name = "Morphe Visual Editor (test)"
        description = "Test build of the visual settings editor, applied on top of Morphe Patches"
        source = "git@github.com:desumax/morphe-patcher-visual.git"
        author = "desumax"
        contact = "na"
        website = "https://github.com/desumax/morphe-patcher-visual"
        license = "GNU General Public License v3.0, with additional GPL section 7 requirements"
    }
}

configurations.compileClasspath {
    attributes {
        attribute(LibraryElements.LIBRARY_ELEMENTS_ATTRIBUTE, objects.named(LibraryElements.JAR))
    }
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(libs.guava)
    implementation(libs.morphe.patches.library)
    compileOnly(project(":patches:stub"))
}

// Loads the built bundle with the patcher, the way Morphe Manager does, and prints its patches.
tasks.register<JavaExec>("listBundlePatches") {
    description = "Lists the patches of the built bundle"
    dependsOn("buildAndroid", "testClasses")
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("app.morphe.patches.youtube.misc.visualeditor.ListBundlePatchesKt")
    doFirst {
        val bundle = layout.buildDirectory.dir("libs").get().asFile
            .listFiles { f -> f.name.endsWith(".mpp") }!!.maxByOrNull { it.lastModified() }!!
        setArgs(listOf(bundle.absolutePath))
    }
}
