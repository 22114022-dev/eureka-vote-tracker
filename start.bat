@echo off
title Eureka 2026 - KHNN Live Vote Tracker
echo ========================================================
echo  🌾 Euréka 2026 - KHNN Live Vote Tracker
echo  Theo doi binh chon de tai KHNN2026-002 (Real-Time)
echo ========================================================
echo Dang khoi chay may chu ung dung...
start http://localhost:5000
python backend/app.py
pause
