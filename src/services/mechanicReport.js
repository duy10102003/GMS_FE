import api from './api.js'
import { API_ENDPOINTS } from '@/constant/api'

class MechanicReportService {
  async getMySummary(mechanicId) {
    return await api.get(API_ENDPOINTS.MECHANIC.REPORT_SUMMARY(mechanicId))
  }
}

export default new MechanicReportService()

