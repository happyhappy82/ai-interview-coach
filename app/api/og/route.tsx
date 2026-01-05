import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const score = searchParams.get('score')
    const title = searchParams.get('title') || 'AI 면접 분석 결과'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* 메인 컨텐츠 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '32px',
              padding: '80px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* 아이콘 */}
            <div
              style={{
                fontSize: '120px',
                marginBottom: '40px',
              }}
            >
              🎯
            </div>

            {/* 타이틀 */}
            <div
              style={{
                fontSize: '60px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              AI 면접 코치
            </div>

            {/* 점수 */}
            {score && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '24px',
                  padding: '24px 48px',
                  marginTop: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '80px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {score}점
                </div>
              </div>
            )}

            {/* 서브타이틀 */}
            <div
              style={{
                fontSize: '32px',
                color: '#666',
                marginTop: '40px',
                textAlign: 'center',
              }}
            >
              {title}
            </div>
          </div>

          {/* 푸터 */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            취업 합격률을 높이는 AI 면접 연습
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG 이미지 생성 실패:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
