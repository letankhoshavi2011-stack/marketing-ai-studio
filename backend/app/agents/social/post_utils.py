from typing import Any, Dict, List


def ensure_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def first_non_empty_text(*values: Any) -> str:
    for value in values:
        if isinstance(value, str):
            stripped = value.strip()
            if stripped:
                return stripped
        elif value is not None:
            text = str(value).strip()
            if text:
                return text
    return ""


def normalize_hashtags(value: Any) -> List[str]:
    values = ensure_list(value)
    output: List[str] = []
    for item in values:
        if isinstance(item, str):
            parts = [p.strip() for p in item.replace("\n", ",").split(",")]
            output.extend([p for p in parts if p])
        elif item is not None:
            text = str(item).strip()
            if text:
                output.append(text)
    return output


def normalize_prompt_list(value: Any) -> List[str]:
    values = ensure_list(value)
    output: List[str] = []
    for item in values:
        if item is None:
            continue
        text = str(item).strip()
        if text:
            output.append(text)
    return output


def extract_image_prompts(raw_post: Dict[str, Any]) -> List[str]:
    prompts = normalize_prompt_list(raw_post.get("image_prompts"))
    if prompts:
        return prompts

    slide_like = raw_post.get("slides") or raw_post.get("carousel_slides") or raw_post.get("frames") or []
    if not isinstance(slide_like, list):
        return []

    for slide in slide_like:
        if not isinstance(slide, dict):
            continue
        prompts.extend(normalize_prompt_list(slide.get("image_prompts")))
        single_prompt = first_non_empty_text(
            slide.get("image_prompt"),
            slide.get("visual_prompt"),
            slide.get("prompt"),
        )
        if single_prompt:
            prompts.append(single_prompt)

    deduped: List[str] = []
    seen = set()
    for prompt in prompts:
        key = prompt.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(prompt)
    return deduped


def normalize_social_post(
    raw: Any,
    platform: str,
    fallback_caption: str = "",
    default_posting_time: str = "Morning",
) -> Dict[str, Any]:
    raw_post = raw if isinstance(raw, dict) else {}

    caption = first_non_empty_text(
        raw_post.get("caption"),
        raw_post.get("text"),
        raw_post.get("body_text"),
        raw_post.get("description"),
        raw_post.get("script"),
        raw_post.get("intro_text"),
        raw_post.get("full_article_content"),
        raw_post.get("article_content"),
        raw_post.get("message"),
        raw_post.get("summary"),
        raw_post.get("title"),
        fallback_caption,
        "Generated post",
    )

    normalized = dict(raw_post)
    normalized["platform"] = first_non_empty_text(raw_post.get("platform"), platform) or platform
    normalized["caption"] = caption
    normalized["image_prompts"] = extract_image_prompts(raw_post)
    normalized["video_prompts"] = normalize_prompt_list(raw_post.get("video_prompts"))
    normalized["hashtags"] = normalize_hashtags(raw_post.get("hashtags") or raw_post.get("tags"))
    normalized["posting_time_suggestion"] = first_non_empty_text(
        raw_post.get("posting_time_suggestion"),
        raw_post.get("best_time"),
        default_posting_time,
    )

    return normalized
