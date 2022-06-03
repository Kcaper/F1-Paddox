from django.apps import AppConfig

class SchedulerConfig(AppConfig):
    name = 'scheduler'

    def ready(self):
        print("Starting sheduler ...")
        from .results_scheduler import results_updater
        results_updater.start(1)
        print("sheduler has started")
