const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function utf8OffsetToUtf16(text: string, utf8Offset: number): number {
	const utf8Bytes = textEncoder.encode(text);
	const slicedBytes = utf8Bytes.slice(0, utf8Offset);
	const slicedText = textDecoder.decode(slicedBytes);
	return slicedText.length;
}

export function utf16OffsetToUtf8(text: string, utf16Offset: number): number {
	const slicedText = text.slice(0, utf16Offset);
	const utf8Bytes = textEncoder.encode(slicedText);
	return utf8Bytes.length;
}
