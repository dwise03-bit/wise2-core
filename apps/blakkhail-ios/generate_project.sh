#!/bin/bash
set -e

echo "🔨 Generating Complete Xcode Project..."

PROJECT_NAME="Blakkhail"
BUNDLE_ID="com.sencere.blakkhail"
TEAM_ID="PLACEHOLDER"  # Will be auto-detected

# Create project structure
mkdir -p "${PROJECT_NAME}.xcodeproj"

# Generate complete project.pbxproj
cat > "${PROJECT_NAME}.xcodeproj/project.pbxproj" << 'PBXPROJ_END'
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		OBJ_100 /* BlakkhailApp.swift in Sources */ = {isa = PBXBuildFile; fileRef = OBJ_9 /* BlakkhailApp.swift */; };
		OBJ_101 /* HomeView.swift in Sources */ = {isa = PBXBuildFile; fileRef = OBJ_11 /* HomeView.swift */; };
		OBJ_102 /* ProductCatalogView.swift in Sources */ = {isa = PBXBuildFile; fileRef = OBJ_12 /* ProductCatalogView.swift */; };
		OBJ_103 /* ProductDetailView.swift in Sources */ = {isa = PBXBuildFile; fileRef = OBJ_13 /* ProductDetailView.swift */; };
		OBJ_104 /* CartView.swift in Sources */ = {isa = PBXBuildFile; fileRef = OBJ_14 /* CartView.swift */; };
		OBJ_105 /* BrandStoryView.swift in Sources */ = {isa = PBXBuildFile; fileRef = OBJ_15 /* BrandStoryView.swift */; };
		OBJ_106 /* AuthenticationView.swift in Sources */ = {isa = PBXBuildFile; fileRef = OBJ_16 /* AuthenticationView.swift */; };
		OBJ_107 /* AccountView.swift in Sources */ = {isa = PBXBuildFile; fileRef = OBJ_17 /* AccountView.swift */; };
		OBJ_108 /* SwiftUI.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = OBJ_31 /* SwiftUI.framework */; };
		OBJ_109 /* UIKit.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = OBJ_32 /* UIKit.framework */; };
		OBJ_110 /* Foundation.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = OBJ_33 /* Foundation.framework */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		OBJ_9 /* BlakkhailApp.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = BlakkhailApp.swift; sourceTree = SOURCE_ROOT; };
		OBJ_11 /* HomeView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/HomeView.swift; sourceTree = SOURCE_ROOT; };
		OBJ_12 /* ProductCatalogView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/ProductCatalogView.swift; sourceTree = SOURCE_ROOT; };
		OBJ_13 /* ProductDetailView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/ProductDetailView.swift; sourceTree = SOURCE_ROOT; };
		OBJ_14 /* CartView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/CartView.swift; sourceTree = SOURCE_ROOT; };
		OBJ_15 /* BrandStoryView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/BrandStoryView.swift; sourceTree = SOURCE_ROOT; };
		OBJ_16 /* AuthenticationView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/AuthenticationView.swift; sourceTree = SOURCE_ROOT; };
		OBJ_17 /* AccountView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = Views/AccountView.swift; sourceTree = SOURCE_ROOT; };
		OBJ_20 /* Blakkhail.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = Blakkhail.app; sourceTree = BUILT_PRODUCTS_DIR; };
		OBJ_31 /* SwiftUI.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = SwiftUI.framework; path = System/Library/Frameworks/SwiftUI.framework; sourceTree = SDKROOT; };
		OBJ_32 /* UIKit.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = UIKit.framework; path = System/Library/Frameworks/UIKit.framework; sourceTree = SDKROOT; };
		OBJ_33 /* Foundation.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = Foundation.framework; path = System/Library/Frameworks/Foundation.framework; sourceTree = SDKROOT; };
		OBJ_41 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = SOURCE_ROOT; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		OBJ_50 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 0;
			files = (
				OBJ_108 /* SwiftUI.framework in Frameworks */,
				OBJ_109 /* UIKit.framework in Frameworks */,
				OBJ_110 /* Foundation.framework in Frameworks */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		OBJ_1 /*  */ = {
			isa = PBXGroup;
			children = (
				OBJ_9 /* BlakkhailApp.swift */,
				OBJ_6 /* Views */,
				OBJ_41 /* Info.plist */,
				OBJ_25 /* Frameworks */,
				OBJ_20 /* Blakkhail.app */,
			);
			sourceTree = SOURCE_ROOT;
		};
		OBJ_6 /* Views */ = {
			isa = PBXGroup;
			children = (
				OBJ_11 /* HomeView.swift */,
				OBJ_12 /* ProductCatalogView.swift */,
				OBJ_13 /* ProductDetailView.swift */,
				OBJ_14 /* CartView.swift */,
				OBJ_15 /* BrandStoryView.swift */,
				OBJ_16 /* AuthenticationView.swift */,
				OBJ_17 /* AccountView.swift */,
			);
			path = Views;
			sourceTree = SOURCE_ROOT;
		};
		OBJ_25 /* Frameworks */ = {
			isa = PBXGroup;
			children = (
				OBJ_26 /* iOS */,
			);
			name = Frameworks;
			sourceTree = SOURCE_ROOT;
		};
		OBJ_26 /* iOS */ = {
			isa = PBXGroup;
			children = (
				OBJ_31 /* SwiftUI.framework */,
				OBJ_32 /* UIKit.framework */,
				OBJ_33 /* Foundation.framework */,
			);
			name = iOS;
			sourceTree = SOURCE_ROOT;
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		OBJ_60 /* Blakkhail */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = OBJ_70 /* Build configuration list for PBXNativeTarget "Blakkhail" */;
			buildPhases = (
				OBJ_80 /* Sources */,
				OBJ_50 /* Frameworks */,
			);
			buildRules = ();
			dependencies = ();
			name = Blakkhail;
			productName = Blakkhail;
			productReference = OBJ_20 /* Blakkhail.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		OBJ_1 /* Project object */ = {
			isa = PBXProject;
			buildConfigurationList = OBJ_2 /* Build configuration list for PBXProject "Blakkhail" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (en);
			mainGroup = OBJ_1 /*  */;
			projectDirPath = "";
			projectRoot = "";
			targets = (OBJ_60 /* Blakkhail */);
		};
/* End PBXProject section */

/* Begin PBXSourcesBuildPhase section */
		OBJ_80 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 0;
			files = (
				OBJ_100 /* BlakkhailApp.swift in Sources */,
				OBJ_101 /* HomeView.swift in Sources */,
				OBJ_102 /* ProductCatalogView.swift in Sources */,
				OBJ_103 /* ProductDetailView.swift in Sources */,
				OBJ_104 /* CartView.swift in Sources */,
				OBJ_105 /* BrandStoryView.swift in Sources */,
				OBJ_106 /* AuthenticationView.swift in Sources */,
				OBJ_107 /* AccountView.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		OBJ_3 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_DIALECT = "c++17";
				CLANG_CXX_LIBRARY = "libc++";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_SUSPICIOUS_MOVES = YES;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				CODE_SIGN_IDENTITY = "iPhone Developer";
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = dwarf;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_TESTABILITY = YES;
				GCC_C_LANGUAGE_LEVEL = c99;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (DEBUG = 1, $(inherited));
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				MTL_FAST_MATH = YES;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
				SWIFT_VERSION = 5.9;
			};
			name = Debug;
		};
		OBJ_4 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_DIALECT = "c++17";
				CLANG_CXX_LIBRARY = "libc++";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_SUSPICIOUS_MOVES = YES;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				CODE_SIGN_IDENTITY = "iPhone Developer";
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				GCC_C_LANGUAGE_LEVEL = c99;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_OPTIMIZATION_LEVEL = s;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				MTL_ENABLE_DEBUG_INFO = NO;
				MTL_FAST_MATH = YES;
				SDKROOT = iphoneos;
				SWIFT_COMPILATION_MODE = wholemodule;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
				SWIFT_VERSION = 5.9;
				VALIDATE_PRODUCT = YES;
			};
			name = Release;
		};
		OBJ_71 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				BUNDLE_IDENTIFIER = "com.sencere.blakkhail";
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Info.plist;
				INFOPLIST_KEY_CFBundleDisplayName = "Blakk Hail";
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = UIInterfaceOrientationPortrait;
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown";
				INFOPLIST_KEY_UIUserInterfaceStyle = Dark;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				LD_RUNPATH_SEARCH_PATHS = "$(inherited) @executable_path/Frameworks";
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = "com.sencere.blakkhail";
				PRODUCT_NAME = "$(TARGET_NAME)";
				SUPPORTED_PLATFORMS = "iphoneos iphonesimulator";
				SUPPORTS_MACCATALYST = NO;
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.9;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		OBJ_72 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				BUNDLE_IDENTIFIER = "com.sencere.blakkhail";
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Info.plist;
				INFOPLIST_KEY_CFBundleDisplayName = "Blakk Hail";
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = UIInterfaceOrientationPortrait;
				INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown";
				INFOPLIST_KEY_UIUserInterfaceStyle = Dark;
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				LD_RUNPATH_SEARCH_PATHS = "$(inherited) @executable_path/Frameworks";
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = "com.sencere.blakkhail";
				PRODUCT_NAME = "$(TARGET_NAME)";
				SUPPORTED_PLATFORMS = "iphoneos iphonesimulator";
				SUPPORTS_MACCATALYST = NO;
				SWIFT_EMIT_LOC_STRINGS = NO;
				SWIFT_VERSION = 5.9;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		OBJ_2 /* Build configuration list for PBXProject "Blakkhail" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (OBJ_3 /* Debug */, OBJ_4 /* Release */);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		OBJ_70 /* Build configuration list for PBXNativeTarget "Blakkhail" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (OBJ_71 /* Debug */, OBJ_72 /* Release */);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */
	};
	rootObject = OBJ_1 /* Project object */;
}
PBXPROJ_END

echo "✅ Xcode project generated successfully"
