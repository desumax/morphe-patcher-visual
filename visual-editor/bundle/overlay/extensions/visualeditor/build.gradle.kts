import com.android.build.api.dsl.ApplicationExtension

// The visual editor's own extension. It holds only the editor's classes: the Morphe classes it
// uses (Setting, Utils, Logger, AbstractPreferenceFragment) are compile-only and come from the
// official Morphe Patches extensions already merged into the app.
dependencies {
    compileOnly(libs.annotation)
    compileOnly(libs.morphe.extensions.library)
    compileOnly(project(":extensions:shared:library"))
}

configure<ApplicationExtension> {
    defaultConfig {
        minSdk = 26
    }
}
