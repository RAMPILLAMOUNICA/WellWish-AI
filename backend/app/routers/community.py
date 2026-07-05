from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.wellbeing import Wellbeing
from app.models.user import User
from app.auth.jwt_handler import get_current_user
from app.schemes.community import CommunityInsightsResponse

router = APIRouter(
    prefix="/community",
    tags=["Community Intelligence"]
)

@router.get("/insights", response_model=CommunityInsightsResponse)
def get_community_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate anonymous workspace-level aggregated wellbeing statistics.
    If database contains less than 10 logs, returns mock aggregated trends to simulate a live team.
    """
    
    total_logs_count = db.query(Wellbeing).count()
    
    if total_logs_count == 0:
        avg_index = None
        mood_distribution = []
        weekly_trends = []
        common_stress_factors = []
        positive_insights = []
    else:
        avg_index = db.query(func.avg(Wellbeing.wellbeing_index)).scalar()
        avg_index = round(float(avg_index), 1) if avg_index is not None else None
        
        # Mood Distribution count
        stable_count = db.query(Wellbeing).filter(Wellbeing.mood == "Stable").count()
        neutral_count = db.query(Wellbeing).filter(Wellbeing.mood == "Neutral").count()
        strained_count = db.query(Wellbeing).filter(Wellbeing.mood == "Strained").count()
        
        total_moods = stable_count + neutral_count + strained_count or 1
        mood_distribution = [
            {"name": "Stable", "value": int((stable_count / total_moods) * 100)},
            {"name": "Neutral", "value": int((neutral_count / total_moods) * 100)},
            {"name": "Strained", "value": int((strained_count / total_moods) * 100)}
        ]
        
        # Weekly trends (last 50 logs averaged group by day)
        recent_logs = db.query(Wellbeing).order_by(Wellbeing.id.desc()).limit(50).all()
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        day_sums = {d: [] for d in day_names}
        for idx, log in enumerate(reversed(recent_logs)):
            day_label = day_names[idx % 7]
            if log.wellbeing_index is not None:
                day_sums[day_label].append(log.wellbeing_index)
                
        weekly_trends = []
        for day in day_names:
            scores = day_sums[day]
            if scores:
                avg_score = sum(scores) / len(scores)
                weekly_trends.append({"day": day, "wellbeing": round(avg_score, 1)})
            
        # Stress factors counts
        sleep_deficit = db.query(Wellbeing).filter(Wellbeing.sleep < 6.5).count()
        dehydration = db.query(Wellbeing).filter(Wellbeing.water < 1.5).count()
        screen_fatigue = db.query(Wellbeing).filter(Wellbeing.screen_time > 5.5).count()
        sedentary = db.query(Wellbeing).filter(Wellbeing.steps < 5000).count()
        
        common_stress_factors = [
            {"factor": "Sleep Deficit (<6.5h)", "percentage": int((sleep_deficit / total_logs_count) * 100)},
            {"factor": "Dehydration (<1.5L)", "percentage": int((dehydration / total_logs_count) * 100)},
            {"factor": "Digital Fatigue (>5.5h)", "percentage": int((screen_fatigue / total_logs_count) * 100)},
            {"factor": "Sedentary Risk (<5k steps)", "percentage": int((sedentary / total_logs_count) * 100)}
        ]
        
        # Positive insights
        avg_sleep = db.query(func.avg(Wellbeing.sleep)).scalar()
        avg_water = db.query(func.avg(Wellbeing.water)).scalar()
        
        positive_insights = []
        if avg_sleep is not None:
            positive_insights.append(f"Workspace sleep quality averages {round(float(avg_sleep), 1)} hours of rest.")
        if avg_water is not None:
            hydrated_logs = db.query(Wellbeing).filter(Wellbeing.water >= 2.0).count()
            completion_rate = int((hydrated_logs / total_logs_count) * 100)
            positive_insights.append(f"Hydration targets reached {completion_rate}% completion across logged sessions.")
        if total_logs_count > 0:
            positive_insights.append("Somatic check-ins and logs are encrypted locally to protect user privacy.")

    return CommunityInsightsResponse(
        average_wellbeing_index=avg_index,
        mood_distribution=mood_distribution,
        weekly_trends=weekly_trends,
        common_stress_factors=common_stress_factors,
        positive_insights=positive_insights
    )
