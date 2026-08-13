export declare const DEFAULT_VERSION: string
export declare const CHANGELOG_HEADER: string
export declare function validateSlug(
  value: string
): { ok: true; value: string } | { ok: false; message: string }
export declare function rewritePackageJson(content: string, slug: string): string
export declare function rewriteWranglerName(content: string, slug: string): string
export declare function rewriteDockerCompose(content: string, slug: string): string
export declare function rewriteBanner(content: string, slug: string): string
export declare function rewriteReadme(content: string, slug: string): string
