"""PDF Report Generator for DevOps Maturity Assessments"""

import math
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
from reportlab.graphics.shapes import Drawing, String, Line, Polygon, Circle, Group
from reportlab.graphics import renderPDF


class PDFReportGenerator:
    """Generates PDF reports from assessment data."""

    # Color palette
    COLORS = {
        'primary': colors.HexColor('#1e40af'),
        'primary_light': colors.HexColor('#3b82f6'),
        'primary_bg': colors.HexColor('#eff6ff'),
        'success': colors.HexColor('#15803d'),
        'success_light': colors.HexColor('#bbf7d0'),
        'warning': colors.HexColor('#c2410c'),
        'warning_light': colors.HexColor('#fed7aa'),
        'muted': colors.HexColor('#6b7280'),
        'border': colors.HexColor('#e5e7eb'),
        'background': colors.HexColor('#f9fafb'),
        'white': colors.white,
    }

    MATURITY_COLORS = {
        1: colors.HexColor('#dc2626'),
        2: colors.HexColor('#ea580c'),
        3: colors.HexColor('#ca8a04'),
        4: colors.HexColor('#2563eb'),
        5: colors.HexColor('#16a34a'),
    }

    MATURITY_BG_COLORS = {
        1: colors.HexColor('#fef2f2'),
        2: colors.HexColor('#fff7ed'),
        3: colors.HexColor('#fefce8'),
        4: colors.HexColor('#eff6ff'),
        5: colors.HexColor('#f0fdf4'),
    }

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Create custom paragraph styles."""
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=26,
            textColor=self.COLORS['primary'],
            spaceAfter=4,
            alignment=TA_CENTER,
            leading=32,
        ))

        self.styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=self.styles['Normal'],
            fontSize=13,
            textColor=self.COLORS['muted'],
            alignment=TA_CENTER,
            spaceAfter=4,
        ))

        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=15,
            textColor=self.COLORS['primary'],
            spaceBefore=20,
            spaceAfter=10,
            borderColor=self.COLORS['primary'],
            borderWidth=0,
            borderPadding=0,
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
            leftIndent=16,
            spaceBefore=3,
            leading=14,
        ))

        self.styles.add(ParagraphStyle(
            name='GapItem',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.COLORS['warning'],
            leftIndent=16,
            spaceBefore=3,
            leading=14,
        ))

        self.styles.add(ParagraphStyle(
            name='RecommendationItem',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.black,
            leftIndent=24,
            spaceBefore=4,
            leading=14,
        ))

        self.styles.add(ParagraphStyle(
            name='SmallText',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=self.COLORS['muted'],
            alignment=TA_CENTER,
        ))

        self.styles.add(ParagraphStyle(
            name='BodyText10',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.black,
            leading=14,
        ))

    def generate(self, report_data: Dict[str, Any]) -> bytes:
        """Generate PDF from assessment report data."""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.6 * inch,
            bottomMargin=0.65 * inch,
        )

        story = []

        story.extend(self._build_header(report_data))
        story.extend(self._build_executive_summary(report_data))
        story.extend(self._build_radar_chart(report_data))
        story.extend(self._build_domain_breakdown(report_data))
        story.extend(self._build_gate_performance(report_data))
        story.extend(self._build_strengths_and_gaps(report_data))
        story.extend(self._build_recommendations(report_data))

        generated_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')

        def _draw_footer(canvas, doc):
            canvas.saveState()
            canvas.setFont('Helvetica', 7)
            canvas.setFillColor(self.COLORS['muted'])
            # Draw a thin line
            canvas.setStrokeColor(self.COLORS['border'])
            canvas.setLineWidth(0.5)
            y = 0.45 * inch
            canvas.line(0.75 * inch, y, letter[0] - 0.75 * inch, y)
            # Footer text centered
            canvas.drawCentredString(
                letter[0] / 2, y - 10,
                f'Generated {generated_at}  |  DevOps Maturity Assessment Platform'
            )
            # Page number
            canvas.drawRightString(
                letter[0] - 0.75 * inch, y - 10,
                f'Page {canvas.getPageNumber()}'
            )
            canvas.restoreState()

        doc.build(story, onFirstPage=_draw_footer, onLaterPages=_draw_footer)
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

        elements.append(Paragraph('DevOps Maturity Assessment', self.styles['ReportTitle']))
        elements.append(Paragraph(team_name, self.styles['ReportSubtitle']))
        elements.append(Paragraph(date_str, self.styles['SmallText']))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(
            width="100%", thickness=2, color=self.COLORS['primary'],
            spaceAfter=6, spaceBefore=0
        ))

        return elements

    def _build_executive_summary(self, report_data: Dict) -> List:
        """Build executive summary with score display."""
        elements = []

        assessment = report_data.get('assessment', {})
        maturity_level = report_data.get('maturity_level', {})

        overall_score = assessment.get('overall_score', 0)
        level = maturity_level.get('level', 1)
        level_name = maturity_level.get('name', 'Initial')
        level_desc = maturity_level.get('description', '')

        elements.append(Paragraph('Executive Summary', self.styles['SectionHeader']))

        score_color = self.MATURITY_COLORS.get(level, self.COLORS['muted'])
        bg_color = self.MATURITY_BG_COLORS.get(level, self.COLORS['background'])

        score_style = ParagraphStyle(
            'ScoreDisplay', parent=self.styles['Normal'],
            fontSize=42, textColor=score_color, alignment=TA_CENTER, leading=48
        )
        label_style = ParagraphStyle(
            'ScoreLabel', parent=self.styles['Normal'],
            fontSize=9, textColor=self.COLORS['muted'], alignment=TA_CENTER
        )
        level_style = ParagraphStyle(
            'LevelDisplay', parent=self.styles['Normal'],
            fontSize=16, textColor=score_color, alignment=TA_LEFT, leading=22
        )
        desc_style = ParagraphStyle(
            'LevelDescription', parent=self.styles['Normal'],
            fontSize=10, textColor=self.COLORS['muted'], alignment=TA_LEFT, leading=14
        )

        score_cell = [
            Paragraph(f'<b>{overall_score:.0f}</b>', score_style),
            Paragraph('Overall Score', label_style),
        ]

        level_cell = [
            Paragraph(f'<b>Level {level}: {level_name}</b>', level_style),
            Spacer(1, 4),
            Paragraph(level_desc, desc_style),
        ]

        score_data = [[score_cell, level_cell]]

        score_table = Table(score_data, colWidths=[1.8 * inch, 4.7 * inch])
        score_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), bg_color),
            ('BOX', (0, 0), (-1, -1), 1, self.COLORS['border']),
            ('LINEAFTER', (0, 0), (0, 0), 1, self.COLORS['border']),
            ('LEFTPADDING', (0, 0), (-1, -1), 16),
            ('RIGHTPADDING', (0, 0), (-1, -1), 16),
            ('TOPPADDING', (0, 0), (-1, -1), 14),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ]))

        elements.append(score_table)
        elements.append(Spacer(1, 6))

        return elements

    def _build_radar_chart(self, report_data: Dict) -> List:
        """Build radar chart visualization of domain scores."""
        elements = []

        domain_breakdown = report_data.get('domain_breakdown', [])
        if not domain_breakdown or len(domain_breakdown) < 3:
            return elements

        elements.append(Paragraph('Domain Score Overview', self.styles['SectionHeader']))

        chart_size = 320
        drawing = Drawing(500, chart_size + 20)

        cx = 250
        cy = chart_size / 2 + 10
        radius = 120
        n = len(domain_breakdown)

        # Draw concentric rings and grid lines
        for ring_pct in [20, 40, 60, 80, 100]:
            r = radius * ring_pct / 100
            ring_group = Group()
            points = []
            for i in range(n):
                angle = (2 * math.pi * i / n) - math.pi / 2
                px = cx + r * math.cos(angle)
                py = cy + r * math.sin(angle)
                points.append((px, py))

            # Draw ring polygon
            for i in range(n):
                x1, y1 = points[i]
                x2, y2 = points[(i + 1) % n]
                line = Line(x1, y1, x2, y2)
                line.strokeColor = self.COLORS['border']
                line.strokeWidth = 0.5
                drawing.add(line)

            # Add percentage label on top axis
            label_y = cy + r
            pct_label = String(cx + 4, label_y + 2, f'{ring_pct}%')
            pct_label.fontSize = 6
            pct_label.fillColor = self.COLORS['muted']
            drawing.add(pct_label)

        # Draw axis lines from center to each vertex
        for i in range(n):
            angle = (2 * math.pi * i / n) - math.pi / 2
            px = cx + radius * math.cos(angle)
            py = cy + radius * math.sin(angle)
            line = Line(cx, cy, px, py)
            line.strokeColor = self.COLORS['border']
            line.strokeWidth = 0.5
            drawing.add(line)

        # Draw data polygon
        data_points = []
        for i, domain in enumerate(domain_breakdown):
            score = domain.get('score', 0)
            angle = (2 * math.pi * i / n) - math.pi / 2
            r = radius * score / 100
            px = cx + r * math.cos(angle)
            py = cy + r * math.sin(angle)
            data_points.append(px)
            data_points.append(py)

        polygon = Polygon(data_points)
        polygon.fillColor = colors.Color(0.231, 0.510, 0.965, 0.25)  # #3b82f6 at 25%
        polygon.strokeColor = self.COLORS['primary_light']
        polygon.strokeWidth = 2
        drawing.add(polygon)

        # Draw data points
        for i in range(0, len(data_points), 2):
            dot = Circle(data_points[i], data_points[i + 1], 3)
            dot.fillColor = self.COLORS['primary_light']
            dot.strokeColor = colors.white
            dot.strokeWidth = 1
            drawing.add(dot)

        # Draw domain labels around the chart
        label_margin = 18
        for i, domain in enumerate(domain_breakdown):
            domain_name = domain.get('domain', 'Unknown')
            score = domain.get('score', 0)
            if len(domain_name) > 20:
                domain_name = domain_name[:18] + '...'

            angle = (2 * math.pi * i / n) - math.pi / 2
            lx = cx + (radius + label_margin) * math.cos(angle)
            ly = cy + (radius + label_margin) * math.sin(angle)

            # Determine text anchor based on position
            cos_val = math.cos(angle)
            if cos_val > 0.3:
                anchor = 'start'
                lx += 2
            elif cos_val < -0.3:
                anchor = 'end'
                lx -= 2
            else:
                anchor = 'middle'

            label = String(lx, ly - 4, f'{domain_name}')
            label.fontSize = 7.5
            label.fillColor = colors.black
            label.textAnchor = anchor
            drawing.add(label)

            score_label = String(lx, ly - 13, f'{score:.0f}%')
            score_label.fontSize = 7
            score_label.fillColor = self.COLORS['muted']
            score_label.textAnchor = anchor
            drawing.add(score_label)

        # Center the drawing in a table for alignment
        chart_table = Table([[drawing]], colWidths=[7 * inch])
        chart_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('VALIGN', (0, 0), (0, 0), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (0, 0), 0),
            ('RIGHTPADDING', (0, 0), (0, 0), 0),
            ('TOPPADDING', (0, 0), (0, 0), 0),
            ('BOTTOMPADDING', (0, 0), (0, 0), 0),
        ]))

        elements.append(chart_table)
        elements.append(Spacer(1, 8))

        return elements

    def _make_progress_drawing(self, score: float, width: float = 140, height: float = 12) -> Drawing:
        """Create a graphical progress bar as a Drawing."""
        from reportlab.graphics.shapes import Rect
        d = Drawing(width, height)
        # Background bar
        bg = Rect(0, 1, width, height - 2)
        bg.fillColor = colors.HexColor('#e5e7eb')
        bg.strokeColor = None
        bg.rx = 3
        bg.ry = 3
        d.add(bg)
        # Filled bar
        if score <= 0:
            return d
        fill_width = max(2, width * score / 100)
        fg = Rect(0, 1, fill_width, height - 2)
        fg.fillColor = colors.HexColor('#3b82f6')
        fg.strokeColor = None
        fg.rx = 3
        fg.ry = 3
        d.add(fg)
        return d

    def _build_domain_breakdown(self, report_data: Dict) -> List:
        """Build domain breakdown table."""
        elements = []

        domain_breakdown = report_data.get('domain_breakdown', [])
        if not domain_breakdown:
            return elements

        elements.append(Paragraph('Domain Breakdown', self.styles['SectionHeader']))

        table_data = [['Domain', 'Score', 'Level', 'Progress']]

        for domain in domain_breakdown:
            domain_name = domain.get('domain', 'Unknown')
            score = domain.get('score', 0)
            level = domain.get('maturity_level', 1)
            level_color = self.MATURITY_COLORS.get(level, self.COLORS['muted'])

            level_text = f'<font color="{level_color.hexval()}">' \
                         f'<b>L{level}</b></font>'

            table_data.append([
                domain_name,
                f'{score:.0f}%',
                Paragraph(level_text, self.styles['BodyText10']),
                self._make_progress_drawing(score),
            ])

        col_widths = [2.6 * inch, 0.8 * inch, 0.7 * inch, 2.4 * inch]
        domain_table = Table(table_data, colWidths=col_widths)
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
            ('ALIGN', (1, 1), (2, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, self.COLORS['border']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.COLORS['background']]),
        ]))

        elements.append(domain_table)
        elements.append(Spacer(1, 8))

        return elements

    def _build_gate_performance(self, report_data: Dict) -> List:
        """Build gate performance table."""
        elements = []

        gate_scores = report_data.get('gate_scores', [])
        if not gate_scores:
            return elements

        elements.append(Paragraph('Gate Performance', self.styles['SectionHeader']))

        table_data = [['Gate', 'Score', 'Max', '%']]

        for gate in gate_scores:
            gate_name = gate.get('gate_name', 'Unknown')
            score = gate.get('score', 0)
            max_score = gate.get('max_score', 0)
            percentage = gate.get('percentage', 0)

            pct_color = self.COLORS['success'] if percentage >= 60 else \
                        self.COLORS['warning'] if percentage >= 40 else \
                        colors.HexColor('#dc2626')

            table_data.append([
                gate_name,
                f'{score:.0f}',
                f'{max_score:.0f}',
                Paragraph(
                    f'<font color="{pct_color.hexval()}"><b>{percentage:.0f}%</b></font>',
                    self.styles['BodyText10']
                ),
            ])

        gate_table = Table(table_data, colWidths=[3.5 * inch, 1 * inch, 1 * inch, 1 * inch])
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
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.COLORS['background']]),
        ]))

        elements.append(gate_table)
        elements.append(Spacer(1, 8))

        return elements

    def _build_strengths_and_gaps(self, report_data: Dict) -> List:
        """Build strengths and gaps in a side-by-side or stacked layout."""
        elements = []

        strengths = report_data.get('top_strengths', [])
        gaps = report_data.get('top_gaps', [])

        if not strengths and not gaps:
            return elements

        elements.append(Spacer(1, 4))

        item_style = ParagraphStyle(
            'ListItem', parent=self.styles['Normal'],
            fontSize=9, leftIndent=10, spaceBefore=3, leading=13,
            textColor=colors.black
        )

        # Build strengths content
        strengths_content = []
        if strengths:
            strengths_content.append(Paragraph(
                '<font color="#15803d"><b>Top Strengths</b></font>',
                ParagraphStyle('StrHead', parent=self.styles['Normal'],
                               fontSize=12, spaceAfter=6, leading=16)
            ))
            for s in strengths[:10]:
                strengths_content.append(Paragraph(
                    f'<font color="#15803d"><b>+</b></font>  {s}', item_style
                ))

        # Build gaps content
        gaps_content = []
        if gaps:
            gaps_content.append(Paragraph(
                '<font color="#c2410c"><b>Areas for Improvement</b></font>',
                ParagraphStyle('GapHead', parent=self.styles['Normal'],
                               fontSize=12, spaceAfter=6, leading=16)
            ))
            for g in gaps[:10]:
                gaps_content.append(Paragraph(
                    f'<font color="#c2410c"><b>-</b></font>  {g}', item_style
                ))

        # Use two columns if both exist, full width if only one
        if strengths_content and gaps_content:
            data = [[strengths_content, gaps_content]]
            col_widths = [3.25 * inch, 3.25 * inch]
            table = Table(data, colWidths=col_widths)
            table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('BOX', (0, 0), (0, 0), 0.5, self.COLORS['border']),
                ('BOX', (1, 0), (1, 0), 0.5, self.COLORS['border']),
                ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#f0fdf4')),
                ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#fff7ed')),
            ]))
            elements.append(table)
        else:
            content = strengths_content or gaps_content
            bg = colors.HexColor('#f0fdf4') if strengths_content else colors.HexColor('#fff7ed')
            data = [[content]]
            table = Table(data, colWidths=[6.5 * inch])
            table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('BOX', (0, 0), (-1, -1), 0.5, self.COLORS['border']),
                ('BACKGROUND', (0, 0), (-1, -1), bg),
            ]))
            elements.append(table)

        elements.append(Spacer(1, 8))
        return elements

    def _build_recommendations(self, report_data: Dict) -> List:
        """Build recommendations section."""
        elements = []

        recommendations = report_data.get('recommendations', [])
        if not recommendations:
            return elements

        header = Paragraph('Recommendations', self.styles['SectionHeader'])

        rec_items = []
        for idx, rec in enumerate(recommendations[:10], 1):
            rec_items.append(Paragraph(
                f'<font color="#1e40af"><b>{idx}.</b></font>  {rec}',
                self.styles['RecommendationItem']
            ))

        # Wrap in a styled container
        rec_data = [[rec_items]]
        rec_table = Table(rec_data, colWidths=[6.5 * inch])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), self.COLORS['primary_bg']),
            ('BOX', (0, 0), (-1, -1), 0.5, self.COLORS['border']),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))

        # Keep header and table together to avoid orphaned headers
        elements.append(KeepTogether([header, rec_table]))
        elements.append(Spacer(1, 12))

        return elements

