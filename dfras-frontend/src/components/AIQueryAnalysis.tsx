import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Insights,
  Assessment,
  Timeline,
  LocationOn,
  Speed,
  Security
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';


interface QueryAnalysis {
  query_id: string;
  original_query: string;
  interpreted_query: string;
  analysis_type: string;
  confidence_score: number;
  findings: Array<{
    source: string;
    data: any;
    relevance: string;
  }>;
  root_causes: Array<{
    cause: string;
    confidence: number;
    impact: string;
    evidence: string;
    contributing_factors: string[];
    business_impact: {
      cost_per_incident: number;
      customer_satisfaction_impact: number;
      operational_efficiency_loss: number;
    };
  }>;
  recommendations: Array<{
    title: string;
    priority: string;
    category: string;
    description: string;
    specific_actions: string[];
    estimated_impact: string;
    timeline: string;
    investment_required: string;
    roi_estimate: string;
  }>;
  data_sources: string[];
  timestamp: string;
  processing_time_ms: number;
}

const AIQueryAnalysis: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
  const [error, setError] = useState('');
  
  const { token } = useAuth();
  const { showError, showSuccess } = useNotification();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleAnalyze = async () => {
    if (!query.trim()) {
      showError('Please enter a query to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/analyze`,
        { query: query.trim() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAnalysis(response.data.analysis);
        showSuccess('Query analyzed successfully!');
      } else {
        setError(response.data.error || 'Analysis failed');
        showError(response.data.error || 'Analysis failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to analyze query';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'failure_analysis':
        return <Warning color="error" />;
      case 'performance_analysis':
        return <Speed color="primary" />;
      case 'trend_analysis':
        return <TrendingUp color="success" />;
      case 'predictive_analysis':
        return <Psychology color="secondary" />;
      case 'geographic_analysis':
        return <LocationOn color="info" />;
      case 'driver_analysis':
        return <Security color="warning" />;
      default:
        return <Insights color="primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };


  const formatAnalysisType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology color="primary" />
        AI Query Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Ask questions about your Indian delivery operations in natural language. Get AI-powered insights on failures, delays, warehouse issues, driver performance, and external factors like weather and traffic conditions.
      </Typography>

      {/* Query Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ask a Question
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Example: Why are deliveries failing in Coimbatore? What's causing 'Stockout' issues? How can we improve warehouse performance?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !query.trim()}
            startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Psychology />}
            sx={{ 
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
              }
            }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Query'}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Box>
          {/* Analysis Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getAnalysisTypeIcon(analysis.analysis_type)}
                Analysis Summary
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Original Query:</strong> {analysis.original_query}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Interpreted:</strong> {analysis.interpreted_query}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Analysis Type:</strong>
                    </Typography>
                    <Chip 
                      label={formatAnalysisType(analysis.analysis_type)} 
                      color="primary" 
                      size="small" 
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Confidence:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={analysis.confidence_score * 100} 
                        sx={{ width: 60, height: 6 }}
                      />
                      <Typography variant="caption">
                        {(analysis.confidence_score * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Processing Time:</strong> {analysis.processing_time_ms}ms
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary">
                <strong>Data Sources:</strong> {analysis.data_sources.join(', ')}
              </Typography>
            </CardContent>
          </Card>


          {/* Root Cause Analysis */}
          {analysis.root_causes.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="error" />
                  Root Cause Analysis
                  <Chip 
                    label={`${analysis.root_causes.length} causes identified`} 
                    color="error" 
                    size="small" 
                    variant="outlined"
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Deep analysis of underlying factors contributing to the identified issues
                </Typography>
                {Array.isArray(analysis.root_causes) ? analysis.root_causes.map((cause, index) => (
                  <Card key={index} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning color="error" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {cause.cause}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                            <Chip 
                              label={`${(cause.confidence * 100).toFixed(1)}% confidence`} 
                              color="primary" 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={cause.impact} 
                              color={getPriorityColor(cause.impact) as any}
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mt: 1 }}>
                          {/* Evidence Section */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Assessment color="info" />
                              Evidence & Analysis
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Typography variant="body2">
                                {cause.evidence}
                              </Typography>
                            </Paper>
                          </Box>
                          
                          {/* Contributing Factors */}
                          {cause.contributing_factors && cause.contributing_factors.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Timeline color="warning" />
                                Contributing Factors ({cause.contributing_factors.length})
                              </Typography>
                              <Grid container spacing={1}>
                                {Array.isArray(cause.contributing_factors) ? cause.contributing_factors.map((factor, factorIndex) => (
                                  <Grid item xs={12} sm={6} key={factorIndex}>
                                    <Card variant="outlined" sx={{ p: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Warning color="warning" fontSize="small" />
                                        <Typography variant="body2">
                                          {factor}
                                        </Typography>
                                      </Box>
                                    </Card>
                                  </Grid>
                                )) : (
                                  <Typography color="textSecondary">No contributing factors identified</Typography>
                                )}
                              </Grid>
                            </Box>
                          )}
                          
                          {/* Business Impact Analysis */}
                          {cause.business_impact && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingDown color="error" />
                                Business Impact Analysis
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Cost per Incident
                                    </Typography>
                                    <Typography variant="h6" color="error.main">
                                      ${cause.business_impact.cost_per_incident}
                                    </Typography>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Customer Satisfaction Impact
                                    </Typography>
                                    <Typography variant="h6" color="warning.main">
                                      {(cause.business_impact.customer_satisfaction_impact * 100).toFixed(1)}%
                                    </Typography>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Operational Efficiency Loss
                                    </Typography>
                                    <Typography variant="h6" color="error.main">
                                      {(cause.business_impact.operational_efficiency_loss * 100).toFixed(1)}%
                                    </Typography>
                                  </Card>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                )) : (
                  <Typography color="textSecondary">No root causes identified</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actionable Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" />
                  Actionable Recommendations
                  <Chip 
                    label={`${analysis.recommendations.length} recommendations`} 
                    color="success" 
                    size="small" 
                    variant="outlined"
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Strategic and tactical recommendations to address identified issues and improve operations
                </Typography>
                <Grid container spacing={3}>
                  {Array.isArray(analysis.recommendations) ? analysis.recommendations.map((rec, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                          {/* Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CheckCircle color="success" />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {rec.title}
                            </Typography>
                            <Chip 
                              label={rec.priority} 
                              color={getPriorityColor(rec.priority) as any}
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                          
                          {/* Description */}
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {rec.description}
                          </Typography>
                          
                          {/* Category */}
                          {rec.category && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Category: 
                              </Typography>
                              <Chip 
                                label={rec.category} 
                                size="small" 
                                color="info" 
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          )}
                          
                          {/* Specific Actions */}
                          {rec.specific_actions && rec.specific_actions.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Speed color="primary" />
                                Implementation Steps ({rec.specific_actions.length})
                              </Typography>
                              <List dense>
                                {Array.isArray(rec.specific_actions) ? rec.specific_actions.map((action, actionIndex) => (
                                  <ListItem key={actionIndex} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                      <CheckCircle color="success" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={
                                        <Typography variant="body2">
                                          {action}
                                        </Typography>
                                      } 
                                    />
                                  </ListItem>
                                )) : (
                                  <Typography color="textSecondary">No specific actions defined</Typography>
                                )}
                              </List>
                            </Box>
                          )}
                          
                          {/* Impact Metrics */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TrendingUp color="success" />
                              Expected Impact
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Card variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Impact
                                  </Typography>
                                  <Typography variant="body2" color="primary.main">
                                    {rec.estimated_impact}
                                  </Typography>
                                </Card>
                              </Grid>
                              <Grid item xs={6}>
                                <Card variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Timeline
                                  </Typography>
                                  <Typography variant="body2" color="info.main">
                                    {rec.timeline}
                                  </Typography>
                                </Card>
                              </Grid>
                            </Grid>
                          </Box>
                          
                          {/* Investment & ROI */}
                          {(rec.investment_required || rec.roi_estimate) && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Security color="secondary" />
                                Investment Analysis
                              </Typography>
                              <Grid container spacing={1}>
                                {rec.investment_required && (
                                  <Grid item xs={6}>
                                    <Card variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Investment Required
                                      </Typography>
                                      <Typography variant="body2" color="secondary.main">
                                        {rec.investment_required}
                                      </Typography>
                                    </Card>
                                  </Grid>
                                )}
                                {rec.roi_estimate && (
                                  <Grid item xs={6}>
                                    <Card variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Expected ROI
                                      </Typography>
                                      <Typography variant="body2" color="success.main">
                                        {rec.roi_estimate}
                                      </Typography>
                                    </Card>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )) : (
                    <Typography color="textSecondary">No recommendations available</Typography>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Example Queries */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example Queries
          </Typography>
          <Grid container spacing={1}>
            {[
              "Why are deliveries failing in Coimbatore? What's causing the delays?",
              "Analyze delivery failures in Maharashtra warehouses - what are the main issues?",
              "Why do orders fail due to 'Stockout' and 'Address not found' in Bengaluru?",
              "Compare delivery performance between Shadowfax and In-house drivers",
              "What's causing 'Heavy congestion' delays in Gujarat and how to optimize routes?",
              "Analyze customer feedback patterns - why are ratings low for delayed deliveries?",
              "Why do warehouse operations have 'Slow packing' and 'System issues'?",
              "How do weather conditions (Rain, Fog) impact delivery success rates?",
              "What's the correlation between traffic conditions and delivery failures?",
              "Analyze failure patterns during strikes and holidays - how to prepare?"
            ].map((example, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Chip
                  label={example}
                  onClick={() => setQuery(example)}
                  variant="outlined"
                  sx={{ mb: 1, cursor: 'pointer', fontSize: '0.75rem' }}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIQueryAnalysis;
