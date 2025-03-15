'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/client/supabase'

interface Worker {
  id: string
  name: string
  city: string
  district: string
  phone: string
  sort_order: number
}

interface RepairRequest {
  description: string
  city: string
  district: string
}

export default function WorkerRecommendation() {
  const [repairRequest, setRepairRequest] = useState<RepairRequest>({
    description: '',
    city: '',
    district: ''
  })
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('확인 중...')

  const cities = ['경기', '강원']
  const districts = {
    '경기': ['평택', '안양', '파주', '의정부', '고양', '부천', '수원', '김포', '화성', '하남시', '광주시'],
    '강원': ['원주', '춘천']
  }

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*')
          .limit(1)

        if (error) {
          console.error('연결 확인 중 에러:', error)
          setConnectionStatus('데이터베이스 연결 실패')
          return
        }

        if (data && data.length > 0) {
          setConnectionStatus('데이터베이스 연결됨 (데이터 있음)')
        } else {
          setConnectionStatus('데이터베이스 연결됨 (데이터 없음)')
        }
      } catch (err) {
        console.error('연결 확인 중 예외 발생:', err)
        setConnectionStatus('데이터베이스 연결 실패')
      }
    }

    checkConnection()
  }, [])

  const searchWorkers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { city, district } = repairRequest
      const trimmedCity = city.trim()
      const trimmedDistrict = district.trim()
      
      console.log('검색 시작:', { 
        요청사항: repairRequest.description,
        지역: `${trimmedCity} ${trimmedDistrict}`
      })

      const { data, error } = await supabase
        .from('workers')
        .select()
        .eq('city', trimmedCity)
        .eq('district', trimmedDistrict)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Supabase 에러:', error)
        throw error
      }

      const cleanedData = (data || []).map(worker => ({
        ...worker,
        name: worker.name.trim(),
        city: worker.city.trim(),
        district: worker.district.trim(),
        phone: worker.phone.trim()
      }))

      console.log('검색된 엔지니어:', cleanedData)
      setWorkers(cleanedData)
      
      if (cleanedData.length === 0) {
        setError(`${trimmedCity} ${trimmedDistrict} 지역에 등록된 엔지니어가 없습니다.`)
      }
    } catch (err) {
      console.error('검색 중 에러 발생:', err)
      setError('엔지니어 검색 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setRepairRequest(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'city') {
      setRepairRequest(prev => ({
        ...prev,
        district: '',
        [name]: value
      }))
    }

    setWorkers([])
    setError(null)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">수리 요청 및 엔지니어 검색</h2>
      
      <div className="text-center mb-4 text-sm">
        <span className={connectionStatus.includes('실패') ? 'text-red-500' : 'text-green-500'}>
          {connectionStatus}
        </span>
      </div>

      <div className="mb-8 space-y-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              수리 요청사항
            </label>
            <textarea
              id="description"
              name="description"
              value={repairRequest.description}
              onChange={handleInputChange}
              placeholder="수리가 필요한 내용을 자세히 설명해주세요."
              className="w-full p-2 border rounded-lg min-h-[100px]"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                시/도
              </label>
              <select
                id="city"
                name="city"
                value={repairRequest.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">시/도 선택</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                시/군/구
              </label>
              <select
                id="district"
                name="district"
                value={repairRequest.district}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                disabled={!repairRequest.city}
              >
                <option value="">시/군/구 선택</option>
                {repairRequest.city && districts[repairRequest.city as keyof typeof districts]?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={searchWorkers}
              disabled={!repairRequest.city || !repairRequest.district || !repairRequest.description || loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              엔지니어 검색
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}

        {loading && (
          <div className="text-center">검색 중...</div>
        )}

        {workers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">추천 엔지니어</h3>
            <div className="space-y-4">
              {workers.map((worker) => (
                <div key={worker.id} className="border p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold">{worker.name}</h4>
                      <p className="text-gray-600">{worker.city} {worker.district}</p>
                    </div>
                    <a
                      href={`tel:${worker.phone}`}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      {worker.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 