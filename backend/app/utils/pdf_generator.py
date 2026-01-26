"""PDF Report Generator for DevOps Maturity Assessments"""

from datetime import datetime
from io import BytesIO
from typing import Dict, List, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


class PDFReportGenerator:
    """Generates PDF reports from assessment data."""

    # Color palette
    COLORS = {
        'primary': colors.HexColor('#1e40af'),  # Blue-700
        'success': colors.HexColor('#15803d'),  # Green-700
        'warning': colors.HexColor('#c2410c'),  # Orange-700
        'muted': colors.HexColor('#6b7280'),    # Gray-500
        'border': colors.HexColor('#e5e7eb'),   # Gray-200
        'background': colors.HexColor('#f9fafb'),  # Gray-50
    }

    # Maturity level colors
    MATURITY_COLORS = {
        1: colors.HexColor('#dc2626'),  # Red - Initial
        2: colors.HexColor('#ea580c'),  # Orange - Developing
        3: colors.HexColor('#ca8a04'),  # Yellow - Defined
        4: colors.HexColor('#2563eb'),  # Blue - Managed
        5: colors.HexColor('#16a34a'),  # Green - Optimizing
    }

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Create custom paragraph styles."""
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=self.COLORS['primary'],
            spaceAfter=6,
            alignment=TA_CENTER,
        ))

        self.styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.COLORS['muted'],
            alignment=TA_CENTER,
            spaceAfter=20,
        ))

        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=self.COLORS['primary'],
            spaceBefore=16,
            spaceAfter=8,
            borderColor=self.COLORS['border'],
            borderWidth=1,
            borderPadding=4,
        ))

        self.styles.add(ParagraphStyle(
            name='DomainHeader',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=colors.black,
            spaceBefore=8,
            spaceAfter=4,
        ))

        self.styles.add(ParagraphStyle(
            name='StrengthItem',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.COLORS['success'],
            leftIndent=12,
            spaceBefore=2,
        ))

        self.styles.add(ParagraphStyle(
            name='GapItem',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.COLORS['warning'],
            leftIndent=12,
            spaceBefore=2,
        ))

        self.styles.add(ParagraphStyle(
            name='RecommendationItem',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.black,
            leftIndent=20,
            spaceBefore=4,
        ))

        self.styles.add(ParagraphStyle(
            name='SmallText',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=self.COLORS['muted'],
        ))

    def generate(self, report_data: Dict[str, Any]) -> bytes:
        """
        Generate PDF from assessment report data.

        Args:
            report_data: AssessmentReport dict from scoring engine

        Returns:
            PDF file as bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )

        story = []

        # Build document sections
        story.extend(self._build_header(report_data))
        story.extend(self._build_executive_summary(report_data))
        story.extend(self._build_domain_breakdown(report_data))
        story.extend(self._build_gate_performance(report_data))
        story.extend(self._build_strengths_section(report_data))
        story.extend(self._build_gaps_section(report_data))
        story.extend(self._build_recommendations(report_data))
        story.extend(self._build_footer(report_data))

        doc.build(story)
        return buffer.getvalue()

    def _build_header(self, report_data: Dict) -> List:
        """Build report header section."""
        elements = []

        assessment = report_data.get('assessment', {})
        team_name = assessment.get('team_name', 'Unknown Team')
        completed_at = assessment.get('completed_at')

        if completed_at:
            if isinstance(completed_at, str):
                try:
                    completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    completed_at = datetime.utcnow()
            date_str = completed_at.strftime('%B %d, %Y')
        else:
            date_str = datetime.utcnow().strftime('%B %d, %Y')

        # Title
        elements.append(Paragraph('DevOps Maturity Assessment Report', self.styles['ReportTitle']))
        elements.append(Paragraph(f'Team: {team_name}', self.styles['ReportSubtitle']))
        elements.append(Paragraph(f'Assessment Date: {date_str}', self.styles['SmallText']))
        elements.append(Spacer(1, 12))
        elements.append(HRFlowable(width="100%", thickness=1, color=self.COLORS['border']))
        elements.append(Spacer(1, 12))

        return elements

    def _build_executive_summary(self, report_data: Dict) -> List:
        """Build executive summary section with overall score."""
        elements = []

        assessment = report_data.get('assessment', {})
        maturity_level = report_data.get('maturity_level', {})

        overall_score = assessment.get('overall_score', 0)
        level = maturity_level.get('level', 1)
        level_name = maturity_level.get('name', 'Initial')
        level_desc = maturity_level.get('description', '')

        elements.append(Paragraph('Executive Summary', self.styles['SectionHeader']))

        # Score table
        score_color = self.MATURITY_COLORS.get(level, self.COLORS['muted'])

        score_data = [
            [
                Paragraph(f'<b>{overall_score:.1f}</b>',
                         ParagraphStyle('ScoreNum', parent=self.styles['Normal'],
                                       fontSize=36, textColor=score_color, alignment=TA_CENTER)),
                Paragraph(f'<b>Level {level}: {level_name}</b><br/><font size="10">{level_desc}</font>',
                         ParagraphStyle('LevelDesc', parent=self.styles['Normal'],
                                       fontSize=14, alignment=TA_LEFT)),
            ]
        ]

        score_table = Table(score_data, colWidths=[1.5*inch, 4.5*inch])
        score_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), self.COLORS['background']),
            ('BOX', (0, 0), (-1, -1), 1, self.COLORS['border']),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))

        elements.append(score_table)
        elements.append(Spacer(1, 12))

        return elements

    def _build_domain_breakdown(self, report_data: Dict) -> List:
        """Build domain breakdown section."""
        elements = []

        domain_breakdown = report_data.get('domain_breakdown', [])

        if not domain_breakdown:
            return elements

        elements.append(Paragraph('Domain Breakdown', self.styles['SectionHeader']))

        # Create domain table
        table_data = [['Domain', 'Score', 'Level', 'Progress']]

        for domain in domain_breakdown:
            domain_name = domain.get('domain', 'Unknown')
            score = domain.get('score', 0)
            level = domain.get('maturity_level', 1)

            # Create progress bar representation
            filled = int(score / 10)
            progress = '█' * filled + '░' * (10 - filled)

            table_data.append([
                domain_name,
                f'{score:.1f}%',
                f'Level {level}',
                progress,
            ])

        domain_table = Table(table_data, colWidths=[2.5*inch, 1*inch, 1*inch, 2*inch])
        domain_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.COLORS['primary']),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, self.COLORS['border']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ]))

        elements.append(domain_table)
        elements.append(Spacer(1, 12))

        return elements

    def _build_gate_performance(self, report_data: Dict) -> List:
        """Build gate performance section."""
        elements = []

        gate_scores = report_data.get('gate_scores', [])

        if not gate_scores:
            return elements

        elements.append(Paragraph('Gate Performance', self.styles['SectionHeader']))

        # Create gate table
        table_data = [['Gate', 'Score', 'Max', 'Percentage']]

        for gate in gate_scores:
            gate_name = gate.get('gate_name', 'Unknown')
            score = gate.get('score', 0)
            max_score = gate.get('max_score', 0)
            percentage = gate.get('percentage', 0)

            table_data.append([
                gate_name,
                f'{score:.0f}',
                f'{max_score:.0f}',
                f'{percentage:.0f}%',
            ])

        gate_table = Table(table_data, colWidths=[3.5*inch, 1*inch, 1*inch, 1*inch])
        gate_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.COLORS['primary']),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, self.COLORS['border']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
        ]))

        elements.append(gate_table)
        elements.append(Spacer(1, 12))

        return elements

    def _build_strengths_section(self, report_data: Dict) -> List:
        """Build top strengths section."""
        elements = []

        strengths = report_data.get('top_strengths', [])

        if not strengths:
            return elements

        elements.append(Paragraph('Top Strengths', self.styles['SectionHeader']))

        for strength in strengths[:10]:
            elements.append(Paragraph(f'✓ {strength}', self.styles['StrengthItem']))

        elements.append(Spacer(1, 8))

        return elements

    def _build_gaps_section(self, report_data: Dict) -> List:
        """Build areas for improvement section."""
        elements = []

        gaps = report_data.get('top_gaps', [])

        if not gaps:
            return elements

        elements.append(Paragraph('Areas for Improvement', self.styles['SectionHeader']))

        for gap in gaps[:10]:
            elements.append(Paragraph(f'⚠ {gap}', self.styles['GapItem']))

        elements.append(Spacer(1, 8))

        return elements

    def _build_recommendations(self, report_data: Dict) -> List:
        """Build recommendations section."""
        elements = []

        recommendations = report_data.get('recommendations', [])

        if not recommendations:
            return elements

        elements.append(Paragraph('Recommendations', self.styles['SectionHeader']))

        for idx, rec in enumerate(recommendations[:10], 1):
            elements.append(Paragraph(f'{idx}. {rec}', self.styles['RecommendationItem']))

        elements.append(Spacer(1, 12))

        return elements

    def _build_footer(self, report_data: Dict) -> List:
        """Build report footer."""
        elements = []

        elements.append(Spacer(1, 20))
        elements.append(HRFlowable(width="100%", thickness=1, color=self.COLORS['border']))
        elements.append(Spacer(1, 8))

        generated_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
        elements.append(Paragraph(
            f'Report generated on {generated_at} | DevOps Maturity Assessment Platform',
            self.styles['SmallText']
        ))

        return elements
