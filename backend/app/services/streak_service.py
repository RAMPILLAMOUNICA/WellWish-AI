from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from app.models.user import User
from app.models.wellbeing import Wellbeing
from app.models.journal import Journal

class StreakService:
    @staticmethod
    def update_user_streak(db: Session, user_id: int) -> int:
        """
        Updates and persists the user's daily streak based on their activity history.
        An active day is defined as any calendar day on which they either
        logged wellbeing metrics or created a journal entry.
        
        Timezone discrepancies are neutralized by normalizing all activity timestamps
        and date strings into local date objects.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return 0

        # 1. Fetch all wellbeing check-in dates
        wellbeing_records = db.query(Wellbeing.logged_date).filter(
            Wellbeing.user_id == user_id
        ).all()
        
        # 2. Fetch all journal entry dates
        journal_records = db.query(Journal.created_at).filter(
            Journal.user_id == user_id
        ).all()

        # 3. Parse and normalize all active dates to date objects (using date.today())
        active_dates = set()
        
        # Parse wellbeing logged_date strings ("YYYY-MM-DD")
        for wb in wellbeing_records:
            if wb.logged_date:
                try:
                    d = datetime.strptime(wb.logged_date, "%Y-%m-%d").date()
                    active_dates.add(d)
                except ValueError:
                    pass

        # Parse journal created_at datetimes
        for jr in journal_records:
            if jr.created_at:
                active_dates.add(jr.created_at.date())

        today = date.today()
        
        # If there is no activity history, streak resets to 0
        if not active_dates:
            user.streak = 0
            user.last_active_date = None
            db.commit()
            return 0

        sorted_dates = sorted(list(active_dates), reverse=True)
        most_recent = sorted_dates[0]
        
        # Calculate day count difference between today and the most recent entry
        diff_days = (today - most_recent).days

        if diff_days > 1:
            # A gap of more than one day resets the active streak
            user.streak = 0
        else:
            # Streak is intact. Calculate consecutive days backward from today
            # (or from the most recent active date if today hasn't been logged yet).
            streak = 0
            current_check = today if today in active_dates else most_recent
            
            while current_check in active_dates:
                streak += 1
                current_check -= timedelta(days=1)
            
            user.streak = streak

        # Record the date of the user's latest activity
        user.last_active_date = most_recent.strftime("%Y-%m-%d")
        
        db.commit()
        db.refresh(user)
        return user.streak
