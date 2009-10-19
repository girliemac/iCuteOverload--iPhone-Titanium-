/**
 * Appcelerator Titanium Mobile
 * This is generated code. Do not modify. Your changes will be lost.
 * Generated code is Copyright (c) 2009 by Appcelerator, Inc.
 * All Rights Reserved.
 */
#import <Foundation/Foundation.h>

@protocol TitaniumAppAssetResolver
- (NSData*) resolveAppAsset:(NSURL*)url;
- (oneway void)release;
- (id)retain;
@end

@interface ApplicationRouting : NSObject<TitaniumAppAssetResolver> {
}
- (NSData*) resolveAppAsset:(NSURL*)url;
- (NSData*) pageNamedAbout;
- (NSData*) pageNamedContent;
- (NSData*) scriptNamedContent;
- (NSData*) pageNamedFave_content;
- (NSData*) pageNamedFavorites;
- (NSData*) pageNamedIndex;
- (NSData*) scriptNamedRss;
- (NSData*) styleNamedStyle;
- (NSData*) pageNamedTag_content;
- (NSData*) pageNamedTagfeed;
- (NSData*) pageNamedTags;

@end
